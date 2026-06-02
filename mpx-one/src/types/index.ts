export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type StatusType = 'active' | 'review' | 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue' | 'open' | 'in_progress' | 'accepted' | 'inactive' | 'decommissioned'
export type DataClassification = 'confidential' | 'sensitive' | 'internal' | 'public'
export type AITier = 1 | 2 | 3 | 4
export type ChangeType = 'normal' | 'standard' | 'emergency'
export type TreatmentType = 'mitigate' | 'transfer' | 'accept' | 'avoid'
export type Lineage = 'tracked' | 'partial' | 'none'
export type RegFramework = 'PDPA' | 'BOT IT Risk' | 'NCSA' | 'NIST CSF' | 'ISO 27001'

export interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: { value: string | number; variant: 'success' | 'warning' | 'danger' }
}

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
  organization_id: string | null
}

export interface ITAsset {
  id: string
  organization_id: string
  name: string
  type: string
  owner: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ChangeRequest {
  id: string
  organization_id: string
  description: string
  type: ChangeType
  status: string
  requested_at: string
  requested_by?: string
}

export interface AITool {
  id: string
  organization_id: string
  name: string
  vendor: string
  use_case: string
  tier: AITier
  status: string
  scores: {
    dataPrivacy: number
    security: number
    transparency: number
    biasAndFairness: number
    accountability: number
  }
}

export interface DataAsset {
  id: string
  organization_id: string
  system: string
  classification: DataClassification
  owner: string
  quality_score: number
  lineage: Lineage
}

export interface RiskRegister {
  id: string
  organization_id: string
  risk_name: string
  level: RiskLevel
  likelihood: string
  impact: string
  owner: string
  treatment: TreatmentType
  status: string
}

export interface RegMapping {
  id: string
  organization_id: string
  control_name: string
  framework: RegFramework
  clause: string
  status: 'mapped' | 'partial' | 'not-mapped'
}

export interface DashboardSummary {
  it_assets: { total: number }
  risks: { open: number; high_severity: number }
  ai_tools: { pending_review: number }
  change_requests: { pending: number }
}
