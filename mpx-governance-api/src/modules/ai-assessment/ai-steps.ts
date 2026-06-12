// 21-Step Sequential End-to-End AI Risk Assessment Workflow Framework
export interface AiStepDef { no: number; phase: string; name: string; responsible: string; deliverable: string; scoreDomain?: string }

export const AI_PHASES = [
  { id: 'intake', label: '① Intake & Screening', steps: [1, 2, 3, 4, 5] },
  { id: 'risk', label: '② Risk Assessment', steps: [6, 7, 8, 9, 10, 11, 12] },
  { id: 'approval', label: '③ Approval', steps: [13] },
  { id: 'implementation', label: '④ Implementation', steps: [14, 15, 16, 17] },
  { id: 'operations', label: '⑤ Operations', steps: [18, 19, 20, 21] },
]

export const AI_STEPS: AiStepDef[] = [
  { no: 1,  phase: 'intake', name: 'Submit AI Tool / Use Case Request', responsible: 'Requester / Business Owner', deliverable: 'AI Use Case Request Form' },
  { no: 2,  phase: 'intake', name: 'Business Value & Alternative Check', responsible: 'Requester & AI PMO', deliverable: 'Value Assessment / Approved Intake' },
  { no: 3,  phase: 'intake', name: 'Intake & Initial Screening', responsible: 'AI Governance / PMO', deliverable: 'Validated Request Form' },
  { no: 4,  phase: 'intake', name: 'Use Case Classification (Risk Tier)', responsible: 'AI Governance / PMO', deliverable: 'Risk Tier Classification' },
  { no: 5,  phase: 'intake', name: 'Policy & Regulatory Mapping', responsible: 'AI Governance / PMO', deliverable: 'Regulatory Applicability Matrix' },
  { no: 6,  phase: 'risk', name: 'Data Risk Assessment', responsible: 'Assessment Team', deliverable: 'Data Risk Scorecard', scoreDomain: 'data' },
  { no: 7,  phase: 'risk', name: 'Model / LLM Risk Assessment', responsible: 'Assessment Team', deliverable: 'Model Reliability Assessment', scoreDomain: 'model' },
  { no: 8,  phase: 'risk', name: 'Ethical & Customer Impact Assessment', responsible: 'Assessment Team', deliverable: 'Ethical Impact Score (EIA)', scoreDomain: 'ethical' },
  { no: 9,  phase: 'risk', name: 'Cybersecurity & AI Threat Assessment', responsible: 'Assessment Team', deliverable: 'Cyber Threat Vector Analysis', scoreDomain: 'cyber' },
  { no: 10, phase: 'risk', name: 'Vendor / Third-Party Risk Assessment', responsible: 'Assessment Team', deliverable: 'Third-Party Risk Report', scoreDomain: 'vendor' },
  { no: 11, phase: 'risk', name: 'Agentic AI Assessment', responsible: 'Assessment Team', deliverable: 'Agentic Control Specification', scoreDomain: 'agentic' },
  { no: 12, phase: 'risk', name: 'Consolidated Scoring & Recommendation', responsible: 'Assessment Team', deliverable: 'Consolidated Risk Scorecard' },
  { no: 13, phase: 'approval', name: 'Approval Decision', responsible: 'Approver / Committee', deliverable: 'Official Approval Record' },
  { no: 14, phase: 'implementation', name: 'Define Guardrails & Conditions of Use', responsible: 'Implementation Team', deliverable: 'Guardrail Document Set' },
  { no: 15, phase: 'implementation', name: 'Implement Controls & Validate Readiness', responsible: 'Implementation Team', deliverable: 'Control Verification Evidence' },
  { no: 16, phase: 'implementation', name: 'User Training & Sign-off', responsible: 'Implementation Team', deliverable: 'User Training Sign-off Log' },
  { no: 17, phase: 'implementation', name: 'AI Incident Response Integration (AI-IRP)', responsible: 'Operations Team', deliverable: 'AI Incident Response Plan' },
  { no: 18, phase: 'operations', name: 'Go-Live', responsible: 'Implementation Team', deliverable: 'AI Tool Register Entry' },
  { no: 19, phase: 'operations', name: 'Monitor Usage & Controls', responsible: 'Operations Team', deliverable: 'Operational Monitoring Dashboard' },
  { no: 20, phase: 'operations', name: 'Periodic Review & Reassessment', responsible: 'Operations Team', deliverable: 'Annual Review & Reassessment Report' },
  { no: 21, phase: 'operations', name: 'End-of-Life & Offboarding', responsible: 'AI Governance', deliverable: 'AI Offboarding Certificate' },
]

export const SCORE_DOMAINS = ['data', 'model', 'ethical', 'cyber', 'vendor', 'agentic']
export const phaseOf = (step: number) => AI_STEPS.find(s => s.no === step)?.phase || 'intake'
