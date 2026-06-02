import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { RiskRegister } from '../entities/risk-register.entity'
import { Issue } from '../entities/issue.entity'
import { ActionPlan } from '../entities/action-plan.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5433/mpx_one',
  synchronize: false,
  entities: [RiskRegister, Issue, ActionPlan, Organization],
})

const RISKS = [
  { risk_id: 'RSK-2026-001', title: 'Data Leakage — ระบบ CRM', category: 'it_risk', related_domain_code: 'IT_RISK', likelihood: 3, impact: 5, treatment: 'mitigate', status: 'open', owner_id: undefined, description: 'ความเสี่ยงที่ข้อมูลลูกค้าใน CRM อาจรั่วไหลจากช่องโหว่ด้าน access control', existing_control: 'Access control policy, periodic review', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-002', title: 'Access Control — Legacy Application', category: 'it_risk', related_domain_code: 'IT_RISK', likelihood: 4, impact: 4, treatment: 'mitigate', status: 'in_progress', owner_id: undefined, description: 'ระบบ legacy ไม่รองรับ MFA และมีสิทธิ์เกินจำเป็น', existing_control: 'Manual review quarterly', control_effectiveness: 'ineffective' },
  { risk_id: 'RSK-2026-003', title: 'AI Hallucination — Customer Chatbot', category: 'ai_risk', related_domain_code: 'AI', likelihood: 3, impact: 4, treatment: 'transfer', status: 'open', owner_id: undefined, description: 'Chatbot ที่ใช้ AI อาจให้ข้อมูลที่ไม่ถูกต้องกับลูกค้า', existing_control: 'Human review on escalated cases', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-004', title: 'PDPA Consent หมดอายุ — Q3', category: 'compliance_risk', related_domain_code: 'PDPA', likelihood: 2, impact: 4, treatment: 'mitigate', status: 'open', owner_id: undefined, description: 'Consent ของลูกค้าหลายรายจะหมดอายุใน Q3 2026 โดยยังไม่มีแผนต่ออายุ', existing_control: 'Consent management system', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-005', title: 'Patch Management Delay — Server', category: 'cyber_risk', related_domain_code: 'CYBER', likelihood: 2, impact: 3, treatment: 'mitigate', status: 'open', owner_id: undefined, description: 'Server หลายตัวยังไม่ได้ patch critical vulnerabilities ภายใน SLA', existing_control: 'Monthly patching cycle', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-006', title: 'Third Party Data Breach — Cloud Vendor', category: 'third_party_risk', related_domain_code: 'THIRD_PARTY', likelihood: 2, impact: 5, treatment: 'transfer', status: 'open', owner_id: undefined, description: 'Cloud vendor อาจประสบ data breach ส่งผลต่อข้อมูลที่เก็บไว้ใน cloud', existing_control: 'Vendor SLA, cyber insurance', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-007', title: 'Insider Threat — Privileged Users', category: 'it_risk', related_domain_code: 'IT_RISK', likelihood: 2, impact: 5, treatment: 'mitigate', status: 'open', owner_id: undefined, description: 'ผู้ดูแลระบบอาจเข้าถึงข้อมูลสำคัญโดยไม่ได้รับอนุญาต', existing_control: 'PAM system, audit logging', control_effectiveness: 'partial' },
  { risk_id: 'RSK-2026-008', title: 'Business Continuity — Data Center Failure', category: 'operational_risk', related_domain_code: 'IT_RISK', likelihood: 1, impact: 5, treatment: 'mitigate', status: 'open', owner_id: undefined, description: 'ความล้มเหลวของ data center หลักอาจทำให้บริการหยุดชะงัก', existing_control: 'DR site, backup procedures', control_effectiveness: 'effective' },
]

const ISSUES = [
  { issue_id: 'ISS-2026-001', type: 'control_deficiency', title: 'MFA ยังไม่ได้เปิดใช้งานใน ERP ระบบสำคัญ', severity: 'high', status: 'open', description: 'ตรวจพบว่าระบบ ERP ซึ่งมีข้อมูล HR ยังไม่ได้เปิด MFA ตามนโยบาย', root_cause: 'vendor integration limitation', corrective_action: 'ประสานงาน vendor เพื่อ enable MFA ผ่าน SSO' },
  { issue_id: 'ISS-2026-002', type: 'evidence_missing', title: 'ขาด evidence การทำ DSAR ครบ SLA — #DSAR-048', severity: 'critical', status: 'in_progress', description: 'คำขอ DSAR หมายเลข 048 เกิน SLA 30 วันแล้ว แต่ยังไม่มีหลักฐานการดำเนินการ', root_cause: 'กระบวนการ handoff ระหว่างทีมไม่ชัดเจน', corrective_action: 'ดำเนินการ DSAR ทันทีและบันทึกหลักฐาน' },
  { issue_id: 'ISS-2026-003', type: 'regulatory_gap', title: 'DPA Agreement กับ Cloud Vendor ยังไม่ครบถ้วน', severity: 'high', status: 'open', description: 'Cloud vendor 2 รายยังไม่ได้ลงนาม DPA ตามข้อกำหนด PDPA มาตรา 40', root_cause: 'procurement process ไม่มี PDPA checkpoint', corrective_action: 'ส่ง DPA ให้ vendor ลงนามภายใน 30 วัน' },
  { issue_id: 'ISS-2026-004', type: 'assessment_gap', title: 'Control CTL-ACC-003 ผล Fail — Periodic Access Review ล่าช้า', severity: 'medium', status: 'pending_review', description: 'Periodic Access Review รอบ Q1/2026 ยังไม่เสร็จสมบูรณ์ มีผู้ใช้ที่ออกจากงานแล้วยังมีสิทธิ์อยู่', root_cause: 'ไม่มีการ automation ตรวจสอบ offboarding', corrective_action: 'ทำ emergency access review และปิดสิทธิ์ที่ไม่จำเป็น' },
  { issue_id: 'ISS-2026-005', type: 'policy_noncompliance', title: 'ROPA Record ไม่อัปเดต — ระบบสินเชื่อ', severity: 'medium', status: 'open', description: 'ROPA Record ของระบบสินเชื่อ Personal Loan ยังเป็นเวอร์ชัน 2024 ยังไม่ reflect การเปลี่ยนแปลงล่าสุด', root_cause: 'ไม่มี process trigger review เมื่อมีการเปลี่ยนแปลงระบบ', corrective_action: 'อัปเดต ROPA และกำหนด review cycle' },
]

const ACTION_PLANS = [
  { action_id: 'ACT-2026-001', description: 'Enable MFA บน ERP ผ่าน SSO integration', priority: 'high', status: 'in_progress', due_date: new Date('2026-07-31') },
  { action_id: 'ACT-2026-002', description: 'ส่งและติดตาม DPA agreement กับ Cloud Vendor A และ B', priority: 'high', status: 'open', due_date: new Date('2026-07-15') },
  { action_id: 'ACT-2026-003', description: 'ทำ emergency access review และ revoke สิทธิ์ที่หมดอายุ', priority: 'critical', status: 'open', due_date: new Date('2026-06-30') },
  { action_id: 'ACT-2026-004', description: 'อัปเดต ROPA Record ระบบสินเชื่อ Personal Loan', priority: 'medium', status: 'open', due_date: new Date('2026-07-31') },
  { action_id: 'ACT-2026-005', description: 'Patch critical vulnerabilities บน 12 servers ที่ค้างอยู่', priority: 'high', status: 'open', due_date: new Date('2026-06-15') },
]

async function run() {
  await ds.initialize()
  console.log('Connected')

  const orgRepo  = ds.getRepository(Organization)
  const riskRepo = ds.getRepository(RiskRegister)
  const issRepo  = ds.getRepository(Issue)
  const actRepo  = ds.getRepository(ActionPlan)

  const org = await orgRepo.findOne({ where: { slug: 'default' } })
  if (!org) { console.error('Default org not found. Run main seed first.'); process.exit(1) }
  const orgId = org.id

  // Risks
  const riskMap: Record<string, string> = {}
  for (const r of RISKS) {
    let ex = await riskRepo.findOne({ where: { risk_id: r.risk_id } })
    if (!ex) {
      ex = await riskRepo.save(riskRepo.create({ ...r, organization_id: orgId }))
      console.log(`  ✓ Risk: ${r.risk_id} — ${r.title}`)
    }
    riskMap[r.risk_id] = ex!.id
  }

  // Issues
  const issMap: Record<string, string> = {}
  for (const i of ISSUES) {
    let ex = await issRepo.findOne({ where: { issue_id: i.issue_id } })
    if (!ex) {
      ex = await issRepo.save(issRepo.create({ ...i, organization_id: orgId }))
      console.log(`  ✓ Issue: ${i.issue_id} — ${i.title}`)
    }
    issMap[i.issue_id] = ex!.id
  }

  // Action Plans linked to risks/issues
  const links: Record<string, { risk?: string; issue?: string }> = {
    'ACT-2026-001': { issue: 'ISS-2026-001', risk: 'RSK-2026-002' },
    'ACT-2026-002': { issue: 'ISS-2026-003', risk: 'RSK-2026-001' },
    'ACT-2026-003': { issue: 'ISS-2026-004', risk: 'RSK-2026-002' },
    'ACT-2026-004': { issue: 'ISS-2026-005' },
    'ACT-2026-005': { risk: 'RSK-2026-005' },
  }

  for (const a of ACTION_PLANS) {
    const ex = await actRepo.findOne({ where: { action_id: a.action_id } })
    if (!ex) {
      const link = links[a.action_id] ?? {}
      await actRepo.save(actRepo.create({
        ...a,
        organization_id: orgId,
        risk_id:  link.risk  ? riskMap[link.risk]  : undefined,
        issue_id: link.issue ? issMap[link.issue] : undefined,
        due_date: a.due_date as any,
      }))
      console.log(`  ✓ Action: ${a.action_id}`)
    }
  }

  await ds.destroy()
  console.log('\n✅ Risk/Issue seed completed!')
}

run().catch(err => { console.error(err); process.exit(1) })
