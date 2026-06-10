import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { WorkflowTemplate } from '../entities/workflow-template.entity'
import { WorkflowInstance } from '../entities/workflow-instance.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [WorkflowTemplate, WorkflowInstance, Organization],
})

const TEMPLATES = [
  { name: 'อนุมัติ ROPA ใหม่', module: 'ropa', description: 'ขั้นตอนตรวจสอบและอนุมัติบันทึกกิจกรรมการประมวลผลใหม่', steps: [
    { name: 'เจ้าของกระบวนการตรวจสอบ', role: 'process_owner', sla_days: 3, action: 'review' },
    { name: 'DPO ตรวจสอบความถูกต้อง', role: 'dpo', sla_days: 5, action: 'approve' },
    { name: 'ผู้บริหารอนุมัติ', role: 'manager', sla_days: 3, action: 'approve' },
  ]},
  { name: 'อนุมัติ DPIA', module: 'dpia', description: 'ขั้นตอนการประเมินและอนุมัติ DPIA', steps: [
    { name: 'ผู้ประเมินกรอกผล', role: 'assessor', sla_days: 7, action: 'review' },
    { name: 'DPO ทบทวน', role: 'dpo', sla_days: 5, action: 'approve' },
    { name: 'อนุมัติขั้นสุดท้าย', role: 'dpo_head', sla_days: 3, action: 'approve' },
  ]},
  { name: 'จัดการเหตุละเมิดข้อมูล', module: 'breach', description: 'ขั้นตอนตอบสนองเหตุละเมิดข้อมูลส่วนบุคคล', steps: [
    { name: 'ประเมินความรุนแรง', role: 'security', sla_days: 1, action: 'review' },
    { name: 'ตัดสินใจแจ้ง PDPC', role: 'dpo', sla_days: 1, action: 'approve' },
    { name: 'สรุปและปิดเหตุ', role: 'dpo', sla_days: 3, action: 'approve' },
  ]},
  { name: 'อนุมัติคำขอสิทธิ์ (DSAR)', module: 'rights', description: 'ขั้นตอนพิจารณาคำขอใช้สิทธิ์เจ้าของข้อมูล', steps: [
    { name: 'ยืนยันตัวตนผู้ร้อง', role: 'officer', sla_days: 3, action: 'review' },
    { name: 'DPO พิจารณา', role: 'dpo', sla_days: 7, action: 'approve' },
  ]},
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const tplRepo = ds.getRepository(WorkflowTemplate)
  const instRepo = ds.getRepository(WorkflowInstance)

  let created = 0
  const saved: WorkflowTemplate[] = []
  for (const t of TEMPLATES) {
    let row = await tplRepo.findOne({ where: { organization_id: o, name: t.name } })
    if (!row) {
      row = await tplRepo.save(tplRepo.create({
        organization_id: o, name: t.name, description: t.description, module: t.module,
        steps: t.steps.map((s, i) => ({ step: i + 1, ...s, sla_days: s.sla_days, auto_assign: false })),
        is_active: true,
      } as any)) as any
      created++
    }
    saved.push(row!)
  }
  console.log(`  ✓ Workflow templates: ${created} created`)

  // Seed a few running instances
  if ((await instRepo.count({ where: { organization_id: o } })) === 0) {
    const samples = [
      { tpl: saved[0], subject: 'ROPA: การพิจารณาสินเชื่อบุคคล', step: 2 },
      { tpl: saved[0], subject: 'ROPA: การจัดการข้อมูล CCTV', step: 1 },
      { tpl: saved[1], subject: 'DPIA: ระบบ KYC ลูกค้าใหม่', step: 2 },
      { tpl: saved[3], subject: 'DSAR: คำขอเข้าถึงข้อมูล #0006', step: 1 },
    ]
    for (const s of samples) {
      const hist = [{ step: 0, actor: 'system', action: 'started', at: new Date().toISOString() }]
      for (let k = 1; k < s.step; k++) hist.push({ step: k, actor: 'reviewer', action: 'approved', at: new Date().toISOString() } as any)
      await instRepo.save(instRepo.create({
        organization_id: o, template_id: s.tpl.id, entity_type: s.tpl.module,
        subject: s.subject, current_step: s.step, status: 'active',
        step_history: hist, started_at: new Date(),
      } as any))
    }
    // one completed
    await instRepo.save(instRepo.create({
      organization_id: o, template_id: saved[3].id, entity_type: 'rights',
      subject: 'DSAR: คำขอลบข้อมูล #0003', current_step: 2, status: 'completed',
      step_history: [
        { step: 0, actor: 'system', action: 'started', at: new Date().toISOString() },
        { step: 1, actor: 'officer', action: 'approved', at: new Date().toISOString() },
        { step: 2, actor: 'dpo', action: 'approved', at: new Date().toISOString() },
      ], started_at: new Date(), completed_at: new Date(),
    } as any))
    console.log('  ✓ Workflow instances: 5 created')
  }

  await ds.destroy()
  console.log('✅ Workflow seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
