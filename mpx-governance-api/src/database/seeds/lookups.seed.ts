import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { Lookup } from '../entities/lookup.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Lookup, Organization],
})

const LOOKUPS: Record<string, string[]> = {
  governance_domain: ['PDPA', 'IT_GOV', 'IT_RISK', 'DATA', 'AI', 'CYBER', 'THIRD_PARTY', 'AUDIT'],
  risk_category: ['it_risk', 'cyber_risk', 'privacy_risk', 'data_risk', 'ai_risk', 'vendor_risk', 'project_risk', 'compliance_risk', 'operational_risk', 'outsourcing_risk'],
  risk_level: ['critical', 'high', 'medium', 'low'],
  control_category: ['access_control', 'data_protection', 'logging_monitoring', 'incident_response', 'vendor_management', 'risk_management', 'change_management', 'project_governance', 'ai_governance', 'privacy_governance', 'audit_evidence'],
  evidence_type: ['policy', 'procedure', 'standard', 'guideline', 'report', 'screenshot', 'approval_record', 'meeting_minutes', 'system_log', 'configuration', 'contract', 'dpa', 'sla', 'assessment_result', 'other'],
  confidentiality_level: ['public', 'internal', 'confidential', 'restricted'],
  assessment_type: ['control_self_assessment', 'risk_assessment', 'maturity_assessment', 'pdpa_assessment', 'it_risk_assessment', 'oic_readiness_assessment', 'vendor_assessment', 'ai_use_case_assessment'],
  scoring_model: ['pass_fail_na', 'maturity_0_5', 'risk_level', 'percentage', 'custom'],
  issue_type: ['assessment_gap', 'audit_finding', 'control_deficiency', 'policy_non_compliance', 'evidence_missing', 'risk_treatment_issue', 'regulatory_gap', 'security_finding', 'vendor_gap'],
  issue_severity: ['critical', 'high', 'medium', 'low'],
  workflow_status: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'closed'],
  application_criticality: ['critical', 'high', 'medium', 'low'],
  project_status: ['proposed', 'approved', 'in_progress', 'on_hold', 'go_live_pending', 'completed', 'cancelled'],
  vendor_type: ['software_vendor', 'cloud_provider', 'outsourcing_provider', 'data_processor', 'ai_tool_provider', 'consultant', 'infrastructure_provider', 'other'],
  framework_type: ['regulation', 'standard', 'framework', 'guideline', 'internal_policy'],
}

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('Default org not found'); process.exit(1) }
  const repo = ds.getRepository(Lookup)

  let n = 0
  for (const [category, values] of Object.entries(LOOKUPS)) {
    let order = 0
    for (const value of values) {
      const exists = await repo.findOne({ where: { organization_id: org.id, category, value } })
      if (!exists) {
        const label = value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        await repo.save(repo.create({ organization_id: org.id, category, value, label, display_order: order++, is_builtin: true }))
        n++
      } else { order++ }
    }
  }
  console.log(`  ✓ Lookups: ${n} created across ${Object.keys(LOOKUPS).length} categories`)
  await ds.destroy()
  console.log('✅ Lookup seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
