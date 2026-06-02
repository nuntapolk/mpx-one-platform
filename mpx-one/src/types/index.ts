// ── Base enums ─────────────────────────────────────────────────
export type RiskLevel       = 'critical' | 'high' | 'medium' | 'low'
export type StatusType      = 'active' | 'review' | 'pending' | 'approved' | 'rejected'
  | 'completed' | 'overdue' | 'open' | 'in_progress' | 'accepted'
  | 'inactive' | 'decommissioned' | 'draft' | 'assigned' | 'submitted'
  | 'under_review' | 'closed' | 'resolved'
export type DataClassification = 'confidential' | 'sensitive' | 'internal' | 'public'
export type AITier          = 1 | 2 | 3 | 4
export type ChangeType      = 'normal' | 'standard' | 'emergency'
export type TreatmentType   = 'mitigate' | 'transfer' | 'accept' | 'avoid'
export type Lineage         = 'tracked' | 'partial' | 'none'
export type RegFramework    = 'PDPA' | 'BOT IT Risk' | 'NCSA' | 'NIST CSF' | 'ISO 27001'
export type ScoringModel    = 'pass_fail' | 'maturity_0_5' | 'risk_based'
export type PassFail        = 'pass' | 'fail' | 'na'

// ── Organization ───────────────────────────────────────────────
export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
  organization_id: string
}

// ── Governance Domain ──────────────────────────────────────────
export interface GovernanceDomain {
  id: string
  code: string
  name: string
  description: string
  is_active: boolean
}

// ── Framework & Obligation ─────────────────────────────────────
export interface Framework {
  id: string
  organization_id: string
  framework_id: string
  name: string
  type: string
  regulator: string
  version: string
  effective_date: string
  description: string
  status: string
  related_domain_code: string
  is_builtin: boolean
}

export interface Obligation {
  id: string
  framework_id: string
  obligation_id: string
  clause: string
  title: string
  description: string
  type: string
  applicability: 'mandatory' | 'recommended' | 'optional'
  related_domain_code: string
  status: string
}

// ── Control ────────────────────────────────────────────────────
export interface Control {
  id: string
  organization_id: string
  control_id: string
  name: string
  objective: string
  description: string
  type: string
  frequency: string
  owner_id: string
  related_domain_code: string
  criticality: RiskLevel
  expected_evidence: string
  testing_procedure: string
  status: string
  is_builtin: boolean
}

export interface ControlMapping {
  id: string
  control_id: string
  framework_id: string
  obligation_id: string
  mapping_type: string
  coverage_level: string
  clause: string
  rationale: string
  status: string
}

// ── Assessment ─────────────────────────────────────────────────
export interface AssessmentTemplate {
  id: string
  organization_id: string
  name: string
  type: string
  framework_id: string
  related_domain_code: string
  scoring_model: ScoringModel
  frequency: string
  description: string
  status: string
  created_at: string
}

export interface AssessmentTemplateControl {
  id: string
  template_id: string
  control_id: string
  control?: Control
  sort_order: number
  is_required: boolean
  guidance: string
}

export interface Assessment {
  id: string
  organization_id: string
  assessment_number: string
  template_id: string
  title: string
  scope: string
  period_start: string
  period_end: string
  assigned_owner_id: string
  reviewer_id: string
  due_date: string
  status: StatusType
  score: number
  result: string
  reviewer_comment: string
  submitted_at: string
  approved_at: string
  created_at: string
  updated_at: string
}

export interface AssessmentProgress extends Assessment {
  template: AssessmentTemplate
  progress: {
    total: number
    answered: number
    pass: number
    fail: number
    findings: number
    score: number | null
  }
}

export interface AssessmentResponse {
  id: string
  assessment_id: string
  control_id: string
  pass_fail: PassFail
  maturity_score: number
  risk_rating: string
  comment: string
  gap_description: string
  has_finding: boolean
  responded_by: string
}

export interface AssessmentStats {
  total: number
  in_progress: number
  submitted: number
  overdue: number
  approved: number
}

// ── Risk ───────────────────────────────────────────────────────
export interface RiskRegister {
  id: string
  organization_id: string
  risk_id: string
  title: string
  description: string
  category: string
  related_domain_code: string
  owner_id: string
  likelihood: number
  impact: number
  inherent_score: number
  control_effectiveness: string
  residual_likelihood: number
  residual_impact: number
  treatment: TreatmentType
  due_date: string
  status: string
  created_at: string
}

export interface ActionPlan {
  id: string
  action_id: string
  description: string
  owner_id: string
  due_date: string
  priority: RiskLevel
  risk_id: string
  issue_id: string
  status: string
  completion_date: string
}

// ── Issue ──────────────────────────────────────────────────────
export interface Issue {
  id: string
  issue_id: string
  type: string
  title: string
  description: string
  severity: RiskLevel
  owner_id: string
  due_date: string
  status: string
  root_cause: string
  corrective_action: string
  created_at: string
}

// ── Evidence ───────────────────────────────────────────────────
export interface Evidence {
  id: string
  evidence_id: string
  name: string
  type: string
  description: string
  file_path: string
  external_link: string
  owner_id: string
  version: string
  effective_date: string
  expiry_date: string
  review_date: string
  confidentiality_level: string
  status: string
}

// ── Dashboard ──────────────────────────────────────────────────
export interface DashboardSummary {
  it_assets:       { total: number }
  risks:           { open: number; high_severity: number }
  ai_tools:        { pending_review: number }
  change_requests: { pending: number }
}

// ── Nav ────────────────────────────────────────────────────────
export interface NavItem {
  id:    string
  label: string
  icon:  string
  href:  string
  badge?: { value: string | number; variant: 'success' | 'warning' | 'danger' }
}
