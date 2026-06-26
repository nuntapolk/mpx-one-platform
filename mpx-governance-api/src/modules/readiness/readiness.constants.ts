// Default scoring methodology v1.0 (from spec). Admin-editable later (Phase 2).
export const DEFAULT_WEIGHTS: Record<string, number> = {
  ropa_coverage: 20,
  controls_evidence: 25,
  data_subject_rights: 15,
  dpia_risk: 15,
  third_parties_dpa: 10,
  incident_breach: 10,
  training_awareness: 5,
}

export const THRESHOLDS = {
  excellent: [85, 100], good: [70, 84], fair: [50, 69], poor: [0, 49],
}

export function statusOf(score: number): string {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

export interface ModuleDef {
  code: string; name: string; table: string;
  // SQL boolean expr identifying a "completed" row; null = presence-based (MVP proxy)
  completedExpr: string | null;
}

// 16 PDPA modules → source tables. completedExpr uses the row alias implicitly (whole-table count).
export const MODULES: ModuleDef[] = [
  { code: 'ropa',            name: 'RoPA',                table: 'ropa_activities',      completedExpr: "status NOT IN ('draft')" },
  { code: 'consent',         name: 'Consent',             table: 'consents',             completedExpr: null },
  { code: 'rights_request',  name: 'Rights Request',      table: 'rights_requests',      completedExpr: "status IN ('completed','closed','fulfilled','resolved')" },
  { code: 'dpia',            name: 'DPIA',                table: 'dpias',                completedExpr: "status IN ('completed','approved','closed')" },
  { code: 'privacy_notice',  name: 'Privacy Notice',      table: 'privacy_notices',      completedExpr: null },
  { code: 'breach',          name: 'Breach Management',   table: 'breach_incidents',     completedExpr: "status IN ('closed','resolved')" },
  { code: 'external_parties',name: 'External Parties',    table: 'external_parties',     completedExpr: null },
  { code: 'data_map',        name: 'Data Map',            table: 'data_asset_inventory', completedExpr: null },
  { code: 'security_controls',name:'Security Controls',   table: 'controls',             completedExpr: null },
  { code: 'access_review',   name: 'Access Review',       table: 'access_reviews',       completedExpr: null },
  { code: 'risk_register',   name: 'Risk Register',       table: 'risk_registers',       completedExpr: "status IN ('mitigated','closed','accepted')" },
  { code: 'data_asset',      name: 'Data Asset Inventory',table: 'data_asset_inventory', completedExpr: null },
  { code: 'dpo_task',        name: 'DPO Task',            table: 'dpo_tasks',            completedExpr: null },
  { code: 'training',        name: 'Training',            table: 'training_completions', completedExpr: null },
  { code: 'audit_log',       name: 'Audit Log',           table: 'audit_trails',         completedExpr: null },
  { code: 'evidence',        name: 'Evidence',            table: 'evidences',            completedExpr: "status IN ('accepted','approved')" },
]

// component_code → constituent module codes (for weighted score composition)
export const COMPONENT_MODULES: Record<string, string[]> = {
  ropa_coverage:        ['ropa', 'data_map'],
  controls_evidence:    ['security_controls', 'evidence', 'audit_log', 'access_review'],
  data_subject_rights:  ['rights_request', 'consent', 'privacy_notice'],
  dpia_risk:            ['dpia', 'risk_register'],
  third_parties_dpa:    ['external_parties'],
  incident_breach:      ['breach'],
  training_awareness:   ['training'],
}

export const COMPONENT_NAMES: Record<string, string> = {
  ropa_coverage: 'RoPA Coverage', controls_evidence: 'Controls & Evidence',
  data_subject_rights: 'Data Subject Rights', dpia_risk: 'DPIA & Risk',
  third_parties_dpa: 'Third Parties / DPA', incident_breach: 'Incident & Breach',
  training_awareness: 'Training & Awareness',
}

// 3 sub-score groups (hero cards 2-4)
export const COMPLIANCE_MODULES = ['ropa', 'consent', 'privacy_notice', 'rights_request', 'data_map', 'data_asset']
export const CONTROL_EVIDENCE_MODULES = ['security_controls', 'evidence', 'external_parties', 'audit_log', 'access_review']
export const OPERATIONAL_MODULES = ['training', 'breach', 'dpo_task']
