import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { Dpia } from '../entities/dpia.entity'
import { RopaActivity } from '../entities/ropa.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Dpia, RopaActivity, Organization],
})

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const D = (d: number) => new Date(Date.now() + d * 864e5)

const SCREENING = [
  'large_scale_processing', 'sensitive_data', 'systematic_monitoring',
  'cross_border_transfer', 'automated_decision', 'vulnerable_subjects',
]
const TRIGGER: Record<string, string> = {
  critical: 'ประมวลผลข้อมูลอ่อนไหวจำนวนมาก + โอนข้ามพรมแดน — มีความเสี่ยงสูงต่อสิทธิเจ้าของข้อมูล',
  high: 'มีการเฝ้าติดตามอย่างเป็นระบบและประมวลผลข้อมูลขนาดใหญ่',
  medium: 'การประมวลผลมีความเสี่ยงปานกลางต่อสิทธิเจ้าของข้อมูล',
  low: 'การประมวลผลความเสี่ยงต่ำ ประเมินตามแนวทางมาตรฐาน',
}
const STATUS_BY_RISK: Record<string, string[]> = {
  critical: ['in_progress', 'under_review'],
  high: ['in_progress', 'under_review', 'approved'],
  medium: ['approved', 'completed'],
  low: ['completed', 'approved'],
}
const SCORE: Record<string, number> = { critical: 90, high: 70, medium: 45, low: 20 }
const RESIDUAL: Record<string, string> = { critical: 'high', high: 'medium', medium: 'low', low: 'low' }

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id

  const ropaRepo = ds.getRepository(RopaActivity)
  const dpiaRepo = ds.getRepository(Dpia)
  const ropas = await ropaRepo.find({ where: { organization_id: o }, order: { ropa_code: 'ASC' } })
  console.log(`  found ${ropas.length} ROPA records`)

  let created = 0, skipped = 0
  for (const r of ropas) {
    const existing = await dpiaRepo.findOne({ where: { organization_id: o, ropa_record_id: r.id } })
    if (existing) { skipped++; continue }

    const risk = (r.risk_level && SCORE[r.risk_level] != null) ? r.risk_level : pick(['high', 'medium', 'low'])
    const status = pick(STATUS_BY_RISK[risk])
    const done = status === 'completed' || status === 'approved'
    const residual = RESIDUAL[risk]
    const consult = residual === 'high'
    const scrn = [risk === 'critical' || risk === 'high' ? 'large_scale_processing' : pick(SCREENING)]
    if ((r as any).has_sensitive_data) scrn.push('sensitive_data')
    if ((r as any).cross_border_transfer_flag) scrn.push('cross_border_transfer')

    const code = String(r.ropa_code || '').replace(/^ROPA-/, '') || String(created + 1)
    await dpiaRepo.save(dpiaRepo.create({
      organization_id: o,
      dpia_number: `DPIA-${code}`,
      title: `DPIA — ${r.processing_activity_name}`,
      description: 'การประเมินผลกระทบด้านการคุ้มครองข้อมูลส่วนบุคคลสำหรับกิจกรรมการประมวลผลนี้',
      scope: (r as any).department || 'องค์กร',
      ropa_record_id: r.id,
      status,
      screening_criteria: Array.from(new Set(scrn)),
      trigger_reason: TRIGGER[risk],
      risk_level: risk,
      risk_score: SCORE[risk] + Math.floor(Math.random() * 8) - 4,
      impact_analysis: 'วิเคราะห์ผลกระทบต่อสิทธิและเสรีภาพของเจ้าของข้อมูล รวมถึงโอกาสและความรุนแรงของความเสี่ยง',
      mitigation_plan: 'เข้ารหัสข้อมูล, จำกัดสิทธิการเข้าถึง (least privilege), audit logging, อบรมพนักงาน, ทบทวนประจำปี',
      findings: done ? 'ความเสี่ยงอยู่ในระดับที่ยอมรับได้หลังใช้มาตรการลดความเสี่ยง' : null as any,
      recommendations: 'คงมาตรการความปลอดภัยและทบทวน DPIA เมื่อมีการเปลี่ยนแปลงกิจกรรมการประมวลผล',
      residual_risk_level: residual,
      consultation_required: consult,
      pdpc_consulted_at: consult && done ? D(-pick([10, 20, 30])) : null as any,
      completed_at: status === 'completed' ? D(-pick([5, 15, 30])) : null as any,
      approved_at: status === 'approved' ? D(-pick([5, 15, 30])) : null as any,
      next_review_date: D(pick([180, 365])),
    } as any))
    created++
    if (created % 20 === 0) console.log(`  ... ${created} created`)
  }
  console.log(`  ✓ DPIA bulk: ${created} created, ${skipped} skipped (already existed)`)
  await ds.destroy()
  console.log('✅ DPIA bulk seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
