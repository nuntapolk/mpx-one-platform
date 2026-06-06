import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { Evidence } from '../entities/evidence.entity'
import { EvidenceLink } from '../entities/evidence-link.entity'
import { Organization } from '../entities/organization.entity'
import { Control } from '../entities/control.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5433/mpx_one',
  synchronize: false,
  entities: [Evidence, EvidenceLink, Organization, Control],
})

const EVIDENCES = [
  {
    evidence_id: 'EVD-2026-001',
    name: 'IT Governance Policy v2.1',
    type: 'policy',
    description: 'นโยบาย IT Governance ขององค์กร ฉบับที่ได้รับอนุมัติจาก CIO',
    version: '2.1', status: 'accepted', confidentiality_level: 'internal',
    effective_date: '2026-01-01', expiry_date: '2027-01-01', review_date: '2026-12-01',
    control_codes: ['CTL-GOV-001', 'CTL-GOV-002'],
  },
  {
    evidence_id: 'EVD-2026-002',
    name: 'ROPA Register Q1/2026',
    type: 'report',
    description: 'บันทึกการประมวลผลข้อมูลส่วนบุคคล (ROPA) รอบไตรมาส 1/2026',
    version: '1.0', status: 'accepted', confidentiality_level: 'confidential',
    effective_date: '2026-01-01', expiry_date: '2027-03-31', review_date: '2026-06-30',
    control_codes: ['CTL-DAT-001'],
  },
  {
    evidence_id: 'EVD-2026-003',
    name: 'Privacy Notice — Website v3',
    type: 'policy',
    description: 'ประกาศความเป็นส่วนตัวบนเว็บไซต์หลัก เผยแพร่แล้ว',
    version: '3.0', status: 'accepted', confidentiality_level: 'public',
    effective_date: '2026-02-01', expiry_date: '2027-02-01', review_date: '2026-12-01',
    control_codes: ['CTL-DAT-005'],
  },
  {
    evidence_id: 'EVD-2026-004',
    name: 'Periodic Access Review Report Q1/2026',
    type: 'report',
    description: 'รายงานการทบทวนสิทธิ์การเข้าถึงระบบ รอบ Q1/2026 มีผล Partial',
    version: '1.0', status: 'rejected', confidentiality_level: 'confidential',
    effective_date: '2026-03-31', expiry_date: '2027-03-31', review_date: '2026-06-30',
    control_codes: ['CTL-ACC-003'],
  },
  {
    evidence_id: 'EVD-2026-005',
    name: 'Incident Response Plan v1.5',
    type: 'procedure',
    description: 'แผนตอบสนองต่อเหตุการณ์ความปลอดภัย ทดสอบแล้วรอบ H1/2026',
    version: '1.5', status: 'accepted', confidentiality_level: 'internal',
    effective_date: '2025-07-01', expiry_date: '2026-07-01', review_date: '2026-06-01',
    control_codes: ['CTL-INC-001'],
  },
  {
    evidence_id: 'EVD-2026-006',
    name: 'Change Management Policy',
    type: 'policy',
    description: 'นโยบายการบริหารจัดการการเปลี่ยนแปลง IT ฉบับล่าสุด',
    version: '2.0', status: 'accepted', confidentiality_level: 'internal',
    effective_date: '2026-01-01', expiry_date: '2028-01-01', review_date: '2027-01-01',
    control_codes: ['CTL-CHG-001', 'CTL-CHG-002'],
  },
  {
    evidence_id: 'EVD-2026-007',
    name: 'DPO Appointment Letter',
    type: 'approval_record',
    description: 'หนังสือแต่งตั้ง DPO ลงนามโดย CEO',
    version: '1.0', status: 'accepted', confidentiality_level: 'internal',
    effective_date: '2025-01-01', expiry_date: '2027-01-01', review_date: '2026-12-01',
    control_codes: ['CTL-GOV-009'],
  },
  {
    evidence_id: 'EVD-2026-008',
    name: 'Vulnerability Scan Report — May 2026',
    type: 'report',
    description: 'รายงาน vulnerability scan ประจำเดือนพฤษภาคม 2026',
    version: '1.0', status: 'submitted', confidentiality_level: 'confidential',
    effective_date: '2026-05-31', expiry_date: '2026-07-31', review_date: '2026-06-30',
    control_codes: ['CTL-INC-007'],
  },
  {
    evidence_id: 'EVD-2026-009',
    name: 'PDPA Training Completion Record 2026',
    type: 'report',
    description: 'บันทึกผลการฝึกอบรม PDPA ของพนักงานทุกคน ปี 2026',
    version: '1.0', status: 'draft', confidentiality_level: 'internal',
    effective_date: '2026-06-01', expiry_date: '2027-06-01', review_date: '2026-12-01',
    control_codes: ['CTL-GOV-008'],
  },
  {
    evidence_id: 'EVD-2026-010',
    name: 'AI Use Case Register 2026',
    type: 'report',
    description: 'ทะเบียน AI Use Cases ที่ได้รับการอนุมัติและผ่าน assessment',
    version: '1.0', status: 'accepted', confidentiality_level: 'internal',
    effective_date: '2026-01-01', expiry_date: '2027-01-01', review_date: '2026-12-01',
    control_codes: ['CTL-AI-001', 'CTL-AI-002'],
  },
]

async function run() {
  await ds.initialize()
  console.log('Connected')

  const orgRepo  = ds.getRepository(Organization)
  const evdRepo  = ds.getRepository(Evidence)
  const linkRepo = ds.getRepository(EvidenceLink)
  const ctlRepo  = ds.getRepository(Control)

  const org = await orgRepo.findOne({ where: { slug: 'default' } })
  if (!org) { console.error('Default org not found'); process.exit(1) }

  for (const e of EVIDENCES) {
    let existing = await evdRepo.findOne({ where: { evidence_id: e.evidence_id } })
    if (!existing) {
      existing = await evdRepo.save(evdRepo.create({
        evidence_id:         e.evidence_id,
        name:                e.name,
        type:                e.type as any,
        description:         e.description,
        version:             e.version,
        status:              e.status as any,
        confidentiality_level: e.confidentiality_level as any,
        effective_date:      new Date(e.effective_date) as any,
        expiry_date:         new Date(e.expiry_date) as any,
        review_date:         new Date(e.review_date) as any,
        organization_id:     org.id,
      }))
      console.log(`  ✓ Evidence: ${e.evidence_id} — ${e.name}`)
    }

    // Link to controls
    for (const code of e.control_codes) {
      const ctl = await ctlRepo.findOne({ where: { control_id: code } })
      if (!ctl) continue
      const existingLink = await linkRepo.findOne({ where: { evidence_id: existing.id, linked_id: ctl.id } })
      if (!existingLink) {
        await linkRepo.save(linkRepo.create({ evidence_id: existing.id, linked_type: 'control', linked_id: ctl.id }))
      }
    }
  }

  await ds.destroy()
  console.log('\n✅ Evidence seed completed!')
}

run().catch(err => { console.error(err); process.exit(1) })
