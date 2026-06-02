// Assessment Template seed สำหรับ Phase 1
// แต่ละ template มี control_ids ที่ใช้ใน assessment

export const ASSESSMENT_TEMPLATE_SEED: Array<{
  name: string
  type: string
  framework_id: string
  related_domain_code: string
  scoring_model: string
  frequency: string
  description: string
  control_ids: string[] // control_id codes (CTL-XXX-NNN)
}> = [
  // ── Template 1: PDPA Control Self-Assessment ─────────────────
  {
    name: 'PDPA Governance Self-Assessment',
    type: 'pdpa_assessment',
    framework_id: 'PDPA-TH',
    related_domain_code: 'PDPA',
    scoring_model: 'pass_fail',
    frequency: 'annual',
    description: 'ประเมินความสอดคล้องของการดำเนินงานกับ PDPA พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
    control_ids: [
      'CTL-GOV-009', // DPO Appointment
      'CTL-DAT-001', // ROPA
      'CTL-DAT-002', // Data Classification
      'CTL-DAT-003', // Consent Management
      'CTL-DAT-004', // Data Retention
      'CTL-DAT-005', // Privacy Notice
      'CTL-DAT-006', // DSAR Management
      'CTL-DAT-007', // Data Minimization
      'CTL-DAT-008', // Cross-border Transfer
      'CTL-DAT-009', // DPA Agreement
      'CTL-RSK-005', // DPIA
      'CTL-INC-002', // Breach Notification
    ],
  },

  // ── Template 2: IT Risk Assessment (Lite) ────────────────────
  {
    name: 'IT Risk Management Assessment',
    type: 'it_risk_assessment',
    framework_id: 'BOT-IT-RISK',
    related_domain_code: 'IT_RISK',
    scoring_model: 'maturity_0_5',
    frequency: 'annual',
    description: 'ประเมินความพร้อมด้านการบริหารความเสี่ยง IT ตามแนวทาง BOT IT Risk Guideline',
    control_ids: [
      'CTL-GOV-001', // Governance Committee
      'CTL-RSK-001', // IT Risk Assessment
      'CTL-RSK-002', // Risk Appetite
      'CTL-RSK-003', // Risk Treatment
      'CTL-RSK-004', // Risk Monitoring
      'CTL-RSK-008', // BCP/DRP
      'CTL-RSK-010', // Control Effectiveness Testing
      'CTL-ACC-001', // Access Management
      'CTL-ACC-002', // Privileged Access
      'CTL-ACC-003', // Periodic Access Review
      'CTL-CHG-001', // Change Management
      'CTL-CHG-008', // Patch Management
      'CTL-INC-001', // Incident Response
      'CTL-INC-006', // Security Monitoring
      'CTL-INC-007', // Vulnerability Management
    ],
  },

  // ── Template 3: ISO 27001 Control Assessment ─────────────────
  {
    name: 'ISO/IEC 27001 Control Assessment',
    type: 'control_self_assessment',
    framework_id: 'ISO-27001',
    related_domain_code: 'IT_GOV',
    scoring_model: 'pass_fail',
    frequency: 'annual',
    description: 'ประเมิน controls ตามมาตรฐาน ISO/IEC 27001:2022 Annex A',
    control_ids: [
      'CTL-GOV-001', // Governance Committee
      'CTL-GOV-002', // Policy Approval
      'CTL-GOV-003', // RACI
      'CTL-ACC-001', // Access Management
      'CTL-ACC-002', // Privileged Access
      'CTL-ACC-004', // MFA
      'CTL-ACC-007', // SoD
      'CTL-CHG-001', // Change Management
      'CTL-CHG-003', // SDLC Security
      'CTL-CHG-008', // Patch Management
      'CTL-INC-001', // Incident Response
      'CTL-INC-006', // Security Monitoring
      'CTL-INC-007', // Vulnerability Management
      'CTL-EVD-002', // Audit Trail
      'CTL-3RD-001', // Vendor Due Diligence
      'CTL-3RD-002', // Vendor Contract
    ],
  },

  // ── Template 4: AI Governance Assessment ─────────────────────
  {
    name: 'AI Governance Assessment',
    type: 'ai_assessment',
    framework_id: 'NIST-AI-RMF',
    related_domain_code: 'AI',
    scoring_model: 'risk_based',
    frequency: 'semi_annual',
    description: 'ประเมินความพร้อมด้าน AI Governance ตาม NIST AI RMF',
    control_ids: [
      'CTL-AI-001', // AI Use Case Approval
      'CTL-AI-002', // Human Oversight
      'CTL-AI-003', // Transparency
      'CTL-AI-004', // Bias Assessment
      'CTL-AI-005', // Data Privacy
      'CTL-AI-006', // AI Monitoring
      'CTL-RSK-006', // AI Risk Assessment
    ],
  },

  // ── Template 5: Third Party Risk Assessment ──────────────────
  {
    name: 'Third Party Risk Assessment',
    type: 'third_party_assessment',
    framework_id: 'ISO-27001',
    related_domain_code: 'THIRD_PARTY',
    scoring_model: 'risk_based',
    frequency: 'annual',
    description: 'ประเมินความเสี่ยงจาก vendor, partner และ third parties',
    control_ids: [
      'CTL-GOV-010', // Third Party Framework
      'CTL-3RD-001', // Due Diligence
      'CTL-3RD-002', // Contract Requirements
      'CTL-3RD-003', // Performance Monitoring
      'CTL-3RD-004', // Cloud Assessment
      'CTL-3RD-005', // Outsourcing Risk
      'CTL-3RD-006', // Supply Chain
      'CTL-3RD-007', // Offboarding
    ],
  },
]
