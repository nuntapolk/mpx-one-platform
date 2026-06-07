import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { OicRequirement } from '../entities/oic-requirement.entity'
import { Control } from '../entities/control.entity'
import { Evidence } from '../entities/evidence.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [OicRequirement, Control, Evidence, Organization],
})

// OIC requirement pack — code, area, title, criticality, suggested control_code, suggested evidence_code
const REQS = [
  ['OIC-GOV-01', 'IT Governance', 'คณะกรรมการกำกับดูแล IT', 'high', 'CTL-GOV-001', 'EVD-2026-001'],
  ['OIC-GOV-02', 'IT Governance', 'นโยบาย IT ที่ได้รับอนุมัติ', 'high', 'CTL-GOV-002', 'EVD-2026-001'],
  ['OIC-GOV-03', 'IT Governance', 'การกำหนด owner ของระบบสำคัญ', 'medium', 'CTL-GOV-003', null],
  ['OIC-RISK-01', 'IT Risk Management', 'กระบวนการประเมินความเสี่ยง IT', 'high', 'CTL-RSK-001', null],
  ['OIC-RISK-02', 'IT Risk Management', 'แผนจัดการความเสี่ยง', 'high', 'CTL-RSK-003', null],
  ['OIC-SEC-01', 'IT Security', 'การเฝ้าระวังความปลอดภัย', 'high', 'CTL-INC-006', null],
  ['OIC-SEC-02', 'IT Security', 'การบริหารช่องโหว่', 'high', 'CTL-INC-007', 'EVD-2026-008'],
  ['OIC-OUT-01', 'IT Outsourcing', 'การประเมิน vendor ก่อนทำสัญญา', 'high', 'CTL-3RD-001', null],
  ['OIC-OUT-02', 'IT Outsourcing', 'ข้อกำหนดความปลอดภัยในสัญญา', 'high', 'CTL-3RD-002', null],
  ['OIC-PRJ-01', 'Project Management', 'การบริหารความเสี่ยงโครงการ IT', 'medium', 'CTL-CHG-004', null],
  ['OIC-AUD-01', 'IT Audit', 'แผนตรวจสอบภายใน', 'high', 'CTL-GOV-006', null],
  ['OIC-AUD-02', 'IT Audit', 'การเก็บ audit trail', 'high', 'CTL-EVD-002', null],
  ['OIC-BCP-01', 'Business Continuity / DR', 'แผน BCP/DRP', 'critical', 'CTL-RSK-008', null],
  ['OIC-ACC-01', 'Access Control', 'การทบทวนสิทธิ์เข้าถึง', 'high', 'CTL-ACC-003', 'EVD-2026-004'],
  ['OIC-ACC-02', 'Access Control', 'การควบคุม privileged access', 'critical', 'CTL-ACC-002', null],
  ['OIC-ACC-03', 'Access Control', 'การใช้ MFA', 'high', 'CTL-ACC-004', null],
  ['OIC-INC-01', 'Incident Management', 'แผนตอบสนองเหตุการณ์', 'critical', 'CTL-INC-001', 'EVD-2026-005'],
  ['OIC-CHG-01', 'Change Management', 'กระบวนการ change management', 'high', 'CTL-CHG-001', 'EVD-2026-006'],
  ['OIC-CHG-02', 'Change Management', 'การบริหาร patch', 'high', 'CTL-CHG-008', null],
]

async function run() {
  await ds.initialize()
  console.log('Connected')
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('Default org not found'); process.exit(1) }
  const orgId = org.id

  const ctlRepo = ds.getRepository(Control)
  const evdRepo = ds.getRepository(Evidence)
  const reqRepo = ds.getRepository(OicRequirement)

  let n = 0
  for (const [code, area, title, crit, ctlCode, evdCode] of REQS) {
    const exists = await reqRepo.findOne({ where: { requirement_code: code! } })
    if (exists) continue
    const ctl = ctlCode ? await ctlRepo.findOne({ where: { control_id: ctlCode } }) : null
    const evd = evdCode ? await evdRepo.findOne({ where: { evidence_id: evdCode } }) : null
    await reqRepo.save(reqRepo.create({
      requirement_code: code!, oic_area: area!, requirement_title: title!,
      criticality: crit!, organization_id: orgId, is_builtin: true,
      mapped_control_id: ctl?.id ?? undefined,
      linked_evidence_id: evd?.id ?? undefined,
    }))
    n++
  }
  console.log(`  ✓ OIC requirements: ${n} created`)

  await ds.destroy()
  console.log('\n✅ OIC seed completed!')
}

run().catch(err => { console.error(err); process.exit(1) })
