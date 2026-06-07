import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { Application } from '../entities/application.entity'
import { DataAssetInventory } from '../entities/data-asset-inventory.entity'
import { RopaActivity } from '../entities/ropa.entity'
import { Vendor } from '../entities/vendor.entity'
import { Project } from '../entities/project.entity'
import { AIUseCase } from '../entities/ai-use-case.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Application, DataAssetInventory, RopaActivity, Vendor, Project, AIUseCase, Organization],
})

const APPLICATIONS = [
  { application_code: 'APP-001', application_name: 'Core Banking System', application_type: 'core_system', business_criticality: 'critical', lifecycle_status: 'active', hosting_type: 'on_premise', personal_data_flag: true, sensitive_data_flag: true, iso_scope_flag: true, oic_scope_flag: true, internet_facing_flag: false, description: 'ระบบ core banking หลักขององค์กร' },
  { application_code: 'APP-002', application_name: 'CRM ลูกค้า', application_type: 'business_app', business_criticality: 'high', lifecycle_status: 'active', hosting_type: 'cloud', personal_data_flag: true, sensitive_data_flag: false, oic_scope_flag: true, internet_facing_flag: true, description: 'ระบบบริหารความสัมพันธ์ลูกค้า' },
  { application_code: 'APP-003', application_name: 'HR & Payroll', application_type: 'business_app', business_criticality: 'high', lifecycle_status: 'active', hosting_type: 'cloud', personal_data_flag: true, sensitive_data_flag: true, internet_facing_flag: false, description: 'ระบบทรัพยากรบุคคลและเงินเดือน' },
  { application_code: 'APP-004', application_name: 'Customer Chatbot (AI)', application_type: 'ai_app', business_criticality: 'medium', lifecycle_status: 'active', hosting_type: 'cloud', personal_data_flag: true, ai_enabled_flag: true, internet_facing_flag: true, description: 'AI chatbot บริการลูกค้า' },
  { application_code: 'APP-005', application_name: 'Loan Origination System', application_type: 'core_system', business_criticality: 'critical', lifecycle_status: 'active', hosting_type: 'on_premise', personal_data_flag: true, sensitive_data_flag: true, oic_scope_flag: true, iso_scope_flag: true, description: 'ระบบพิจารณาสินเชื่อ' },
  { application_code: 'APP-006', application_name: 'Legacy Document Mgmt', application_type: 'business_app', business_criticality: 'medium', lifecycle_status: 'retiring', hosting_type: 'on_premise', personal_data_flag: false, description: 'ระบบจัดการเอกสารเก่า กำลัง retire' },
]

const DATA_ASSETS = [
  { data_asset_code: 'DAT-001', data_asset_name: 'ข้อมูลลูกค้า (Customer Master)', data_domain: 'customer', classification: 'personal_data', personal_data_flag: true, data_subject_type: 'ลูกค้า', retention_period: '10 ปี', data_quality_status: 'good' },
  { data_asset_code: 'DAT-002', data_asset_name: 'ข้อมูลพนักงาน', data_domain: 'hr', classification: 'sensitive_personal_data', personal_data_flag: true, sensitive_personal_data_flag: true, data_subject_type: 'พนักงาน', retention_period: '5 ปี' },
  { data_asset_code: 'DAT-003', data_asset_name: 'ข้อมูลธุรกรรมการเงิน', data_domain: 'transaction', classification: 'confidential', personal_data_flag: true, data_subject_type: 'ลูกค้า', retention_period: '10 ปี' },
  { data_asset_code: 'DAT-004', data_asset_name: 'ข้อมูลสินเชื่อ', data_domain: 'credit', classification: 'restricted', personal_data_flag: true, sensitive_personal_data_flag: true, data_subject_type: 'ลูกค้า', retention_period: '10 ปี' },
  { data_asset_code: 'DAT-005', data_asset_name: 'Marketing Analytics Data', data_domain: 'marketing', classification: 'internal', personal_data_flag: true, data_subject_type: 'ลูกค้า', retention_period: '3 ปี' },
]

const VENDORS = [
  { vendor_code: 'VND-001', vendor_name: 'AWS (Cloud)', vendor_type: 'cloud_provider', cloud_provider_flag: true, critical_vendor_flag: true, dpa_available_flag: true, sla_available_flag: true, risk_level: 'high', service_description: 'Cloud infrastructure' },
  { vendor_code: 'VND-002', vendor_name: 'Salesforce', vendor_type: 'software_vendor', data_processor_flag: true, cloud_provider_flag: true, critical_vendor_flag: true, dpa_available_flag: true, sla_available_flag: true, risk_level: 'high', service_description: 'CRM SaaS' },
  { vendor_code: 'VND-003', vendor_name: 'OpenAI', vendor_type: 'ai_tool_provider', ai_provider_flag: true, data_processor_flag: true, dpa_available_flag: false, risk_level: 'critical', service_description: 'LLM API สำหรับ chatbot' },
  { vendor_code: 'VND-004', vendor_name: 'Local IT Outsourcing Co.', vendor_type: 'outsourcing_provider', outsourcing_flag: true, audit_right_flag: true, sla_available_flag: true, risk_level: 'medium', service_description: 'IT support outsourcing' },
  { vendor_code: 'VND-005', vendor_name: 'Workday', vendor_type: 'software_vendor', data_processor_flag: true, cloud_provider_flag: true, dpa_available_flag: true, risk_level: 'medium', service_description: 'HR SaaS' },
]

const PROJECTS = [
  { project_code: 'PRJ-001', project_name: 'Digital Lending Platform', project_type: 'digital_transformation', pdpa_impact_flag: true, it_risk_impact_flag: true, security_review_required_flag: true, architecture_review_required_flag: true, project_status: 'in_progress', risk_level: 'high', description: 'แพลตฟอร์มสินเชื่อดิจิทัลใหม่' },
  { project_code: 'PRJ-002', project_name: 'AI Customer Service Rollout', project_type: 'ai_initiative', pdpa_impact_flag: true, ai_impact_flag: true, security_review_required_flag: true, project_status: 'go_live_pending', risk_level: 'high', description: 'นำ AI chatbot ขึ้นใช้งานจริง' },
  { project_code: 'PRJ-003', project_name: 'ISO 27001 Certification', project_type: 'compliance', it_risk_impact_flag: true, project_status: 'in_progress', risk_level: 'medium', description: 'โครงการขอใบรับรอง ISO 27001' },
  { project_code: 'PRJ-004', project_name: 'Cloud Migration Phase 2', project_type: 'infrastructure', it_risk_impact_flag: true, security_review_required_flag: true, architecture_review_required_flag: true, project_status: 'approved', risk_level: 'high', description: 'ย้ายระบบขึ้น cloud เฟส 2' },
]

const AI_USE_CASES = [
  { ai_use_case_code: 'AI-001', ai_use_case_name: 'Customer Service Chatbot', ai_type: 'chatbot', model_provider: 'OpenAI GPT-4o', external_ai_tool_flag: true, personal_data_used_flag: true, human_oversight_required_flag: true, risk_level: 'high', approval_status: 'approved', description: 'Chatbot ตอบคำถามลูกค้า' },
  { ai_use_case_code: 'AI-002', ai_use_case_name: 'Credit Risk Scoring Model', ai_type: 'machine_learning', model_provider: 'Internal ML', personal_data_used_flag: true, sensitive_data_used_flag: true, human_oversight_required_flag: true, risk_level: 'critical', approval_status: 'under_review', description: 'ML model ประเมินความเสี่ยงสินเชื่อ' },
  { ai_use_case_code: 'AI-003', ai_use_case_name: 'Document Auto-Classification', ai_type: 'analytics', model_provider: 'Internal', personal_data_used_flag: false, risk_level: 'low', approval_status: 'approved', description: 'จำแนกประเภทเอกสารอัตโนมัติ' },
  { ai_use_case_code: 'AI-004', ai_use_case_name: 'Fraud Detection', ai_type: 'machine_learning', model_provider: 'Internal ML', personal_data_used_flag: true, human_oversight_required_flag: true, risk_level: 'high', approval_status: 'approved', description: 'ตรวจจับธุรกรรมผิดปกติ' },
]

const ROPA = [
  { ropa_code: 'ROPA-001', processing_activity_name: 'การพิจารณาสินเชื่อ', purpose: 'ประเมินและอนุมัติสินเชื่อ', lawful_basis: 'สัญญา (มาตรา 24(3))', data_subject_type: 'ลูกค้า', recipient: 'NCB, BOT', cross_border_transfer_flag: false, retention_period: '10 ปี', dpia_required_flag: true, risk_level: 'high' },
  { ropa_code: 'ROPA-002', processing_activity_name: 'บริการลูกค้า CRM', purpose: 'บริการหลังการขาย', lawful_basis: 'ประโยชน์โดยชอบด้วยกฎหมาย', data_subject_type: 'ลูกค้า', recipient: 'ภายใน', retention_period: '7 ปี', risk_level: 'medium' },
  { ropa_code: 'ROPA-003', processing_activity_name: 'การจ่ายเงินเดือน', purpose: 'จ่ายค่าตอบแทนพนักงาน', lawful_basis: 'สัญญาจ้างงาน', data_subject_type: 'พนักงาน', recipient: 'กรมสรรพากร, ประกันสังคม', retention_period: '5 ปี', dpia_required_flag: false, risk_level: 'medium' },
  { ropa_code: 'ROPA-004', processing_activity_name: 'Marketing Automation', purpose: 'ส่ง offer และโปรโมชั่น', lawful_basis: 'ความยินยอม (มาตรา 24)', data_subject_type: 'ลูกค้า', recipient: 'Email vendor', cross_border_transfer_flag: true, retention_period: '3 ปี', risk_level: 'high' },
]

async function seedTable(repo: any, items: any[], codeField: string, orgId: string, label: string) {
  let n = 0
  for (const item of items) {
    const exists = await repo.findOne({ where: { [codeField]: item[codeField] } })
    if (!exists) {
      await repo.save(repo.create({ ...item, organization_id: orgId }))
      n++
    }
  }
  console.log(`  ✓ ${label}: ${n} created`)
}

async function run() {
  await ds.initialize()
  console.log('Connected')
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('Default org not found'); process.exit(1) }
  const orgId = org.id

  await seedTable(ds.getRepository(Application),        APPLICATIONS, 'application_code', orgId, 'Applications')
  await seedTable(ds.getRepository(DataAssetInventory), DATA_ASSETS,  'data_asset_code', orgId, 'Data Assets')
  await seedTable(ds.getRepository(Vendor),            VENDORS,      'vendor_code',     orgId, 'Vendors')
  await seedTable(ds.getRepository(Project),           PROJECTS,     'project_code',    orgId, 'Projects')
  await seedTable(ds.getRepository(AIUseCase),         AI_USE_CASES, 'ai_use_case_code', orgId, 'AI Use Cases')
  await seedTable(ds.getRepository(RopaActivity),      ROPA,         'ropa_code',       orgId, 'ROPA Activities')

  await ds.destroy()
  console.log('\n✅ Inventory seed completed!')
}

run().catch(err => { console.error(err); process.exit(1) })
