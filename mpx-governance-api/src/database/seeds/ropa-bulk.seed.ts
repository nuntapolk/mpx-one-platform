import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { RopaActivity } from '../entities/ropa.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [RopaActivity, Organization],
})

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const D = (d: number) => new Date(Date.now() + d * 864e5)

const ACTIVITIES = [
  'การพิจารณาสินเชื่อบุคคล', 'การเปิดบัญชีเงินฝาก', 'การบริการลูกค้า CRM', 'การจ่ายเงินเดือนพนักงาน',
  'การสรรหาและคัดเลือกบุคลากร', 'การตลาดและส่งโปรโมชั่น', 'การวิเคราะห์พฤติกรรมลูกค้า', 'การจัดการข้อร้องเรียน',
  'การออกบัตรเครดิต', 'การพิจารณาประกันภัย', 'การจัดเก็บข้อมูล CCTV', 'การยืนยันตัวตนลูกค้า (KYC)',
  'การบริหารความสัมพันธ์ผู้ถือหุ้น', 'การจัดการข้อมูลผู้สมัครงาน', 'การให้บริการ Mobile Banking',
  'การประมวลผลธุรกรรมออนไลน์', 'การจัดการข้อมูลสุขภาพพนักงาน', 'การวิเคราะห์เครดิตสกอร์',
  'การจัดส่งเอกสารทางไปรษณีย์', 'การบันทึกการสนทนา Call Center',
]
const DEPTS = ['ฝ่ายสินเชื่อ', 'ฝ่ายปฏิบัติการ', 'ฝ่ายการตลาด', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายไอที', 'ฝ่ายบริการลูกค้า', 'ฝ่ายกฎหมาย', 'ฝ่ายบริหารความเสี่ยง']
const LAWFUL = ['สัญญา (มาตรา 24(3))', 'ความยินยอม (มาตรา 24)', 'ประโยชน์โดยชอบด้วยกฎหมาย (มาตรา 24(5))', 'หน้าที่ตามกฎหมาย (มาตรา 24(6))', 'ความยินยอมโดยชัดแจ้ง (มาตรา 26)']
const SUBJECTS = ['ลูกค้า', 'พนักงาน', 'ผู้สมัครงาน', 'ผู้ถือหุ้น', 'คู่ค้า', 'ผู้เยี่ยมชม']
const PD_CATS = ['ชื่อ-นามสกุล, ที่อยู่, เบอร์โทร', 'เลขบัตรประชาชน, วันเกิด', 'ข้อมูลการเงิน, เลขบัญชี', 'อีเมล, ข้อมูลการติดต่อ', 'ข้อมูลการทำงาน, เงินเดือน']
const SENS_CATS = ['ข้อมูลสุขภาพ', 'ประวัติอาชญากรรม', 'ข้อมูลชีวมิติ (ลายนิ้วมือ/ใบหน้า)', 'ข้อมูลศาสนา', '']
const SYSTEMS = ['Core Banking System', 'CRM Salesforce', 'HR Workday', 'Loan Origination', 'Data Warehouse', 'Mobile App Backend']
const RECIPIENTS = ['ภายในองค์กร', 'NCB, BOT', 'กรมสรรพากร, ประกันสังคม', 'Email vendor (Mailchimp)', 'Cloud provider (AWS)', 'บริษัทในเครือ']
const COUNTRIES = ['Singapore', 'USA', 'Japan', 'EU', '']
const RISK = ['critical', 'high', 'medium', 'low']
const COLLECTION_FMT = ['paper', 'electronic', 'web', 'mobile', 'api']
const STORAGE_FMT = ['database', 'cloud', 'file_server', 'paper_archive']
const ACCESS_ROLES = ['admin', 'manager', 'officer', 'auditor', 'dpo']
const ACCESS_METHODS = ['web_portal', 'api', 'direct_db', 'vpn']
const ENC = ['AES-256', 'TLS 1.3', 'RSA-2048']
const USE_ACT = ['view', 'export', 'analyze', 'share', 'update']
const DPIA_STATUS = ['not_started', 'in_progress', 'completed', 'not_required']
const IMPL_PHASE = ['planning', 'development', 'live', 'review']

function buildRecord(i: number, orgId: string): Partial<RopaActivity> {
  const hasSensitive = Math.random() > 0.6
  const crossBorder = Math.random() > 0.65
  const dpiaReq = Math.random() > 0.5
  const risk = pick(RISK)
  const retYears = pick([1, 3, 5, 7, 10])
  const year = 2026
  const code = `ROPA-${String(i).padStart(4, '0')}`
  return {
    ropa_code: code,
    processing_activity_name: `${pick(ACTIVITIES)} (#${i})`,
    description: 'กิจกรรมการประมวลผลข้อมูลส่วนบุคคลสำหรับการดำเนินธุรกิจตามปกติ',
    department: pick(DEPTS),
    role: pick(['Controller', 'Processor', 'Joint Controller']),
    purpose: 'เพื่อให้บริการลูกค้าและปฏิบัติตามข้อกำหนดทางกฎหมาย',
    lawful_basis: pick(LAWFUL),
    legitimate_interest_description: risk === 'low' ? 'เพื่อประโยชน์ในการดำเนินธุรกิจที่ชอบด้วยกฎหมาย' : '',
    data_subject_type: pick(SUBJECTS),
    personal_data_category: pick(PD_CATS),
    has_sensitive_data: hasSensitive,
    sensitive_data_category: hasSensitive ? pick(SENS_CATS.filter(Boolean)) : '',
    // collection
    direct_collection: true,
    collection_formats: [pick(COLLECTION_FMT), pick(COLLECTION_FMT)],
    privacy_notice_given: true,
    indirect_collection: Math.random() > 0.7,
    indirect_sources: Math.random() > 0.7 ? 'NCB, พันธมิตรทางธุรกิจ' : '',
    indirect_notice_given: Math.random() > 0.5,
    re_noticing_process: 'แจ้งผ่านอีเมลและเว็บไซต์',
    // transfer
    recipient: pick(RECIPIENTS),
    third_party_transfer: Math.random() > 0.5,
    cross_border_transfer_flag: crossBorder,
    cross_border_countries: crossBorder ? pick(COUNTRIES.filter(Boolean)) : '',
    cross_border_country_codes: crossBorder ? ['SG', 'US'] : [],
    cross_border_safeguards: crossBorder ? 'Standard Contractual Clauses (SCC)' : '',
    subject_volume_range: pick(['<1k', '1k-10k', '10k-100k', '>100k']),
    // storage & access
    system_used: pick(SYSTEMS),
    storage_formats: [pick(STORAGE_FMT)],
    internal_data_sources: 'ระบบ core + data warehouse',
    internal_shared_databases: 'CRM, Loan DB',
    use_activities: [pick(USE_ACT), pick(USE_ACT)],
    authorized_access_roles: [pick(ACCESS_ROLES), pick(ACCESS_ROLES)],
    access_methods: [pick(ACCESS_METHODS)],
    encryption_enabled: true,
    encryption_methods: [pick(ENC)],
    data_backup: true,
    backup_location: pick(['DR Site', 'Cloud Backup', 'Offsite Tape']),
    bcdr_plan: Math.random() > 0.3,
    access_during_maintenance: Math.random() > 0.5,
    maintenance_duration: '4 ชั่วโมง/เดือน',
    // security measures
    security_measure_summary: 'Encryption + access control + audit logging',
    technical_measures: 'เข้ารหัสข้อมูล at-rest/in-transit, MFA, firewall, IDS/IPS',
    organizational_measures: 'นโยบายความปลอดภัย, อบรมพนักงาน, NDA, access review',
    data_subject_rights_process: 'รับคำขอผ่าน DSAR portal ภายใน SLA 30 วัน',
    rejection_records: 'บันทึกในระบบ DSAR',
    // retention
    retention_period: `${retYears} ปี`,
    retention_value: retYears,
    retention_unit: 'years',
    retention_criteria: 'ตามข้อกำหนดทางกฎหมายและความจำเป็นทางธุรกิจ',
    deletion_method: pick(['ลบถาวร (secure wipe)', 'anonymize', 'archive แล้วลบ']),
    // implementation
    access_control_defined: true,
    access_control_ref: 'POL-AC-001',
    implementation_phase: pick(IMPL_PHASE),
    gap_count: Math.floor(Math.random() * 5),
    compliance_checks: ['PDPA', 'ISO27701'],
    contact_point: 'dpo@mpx.local',
    operation_manual_files: ['manual_v1.pdf'],
    // DPIA
    dpia_required_flag: dpiaReq,
    dpia_required: dpiaReq,
    dpia_status: dpiaReq ? pick(DPIA_STATUS.filter(s => s !== 'not_required')) : 'not_required',
    dpia_level: dpiaReq ? pick(['high', 'medium', 'low']) : '',
    // timeline
    start_date: D(-pick([30, 60, 90, 180, 365])) as any,
    end_date: undefined,
    // risk
    risk_matrix: { likelihood: pick([1, 2, 3, 4, 5]), impact: pick([1, 2, 3, 4, 5]) },
    risk_level: risk,
    // review
    last_reviewed_at: D(-pick([10, 30, 60])) as any,
    next_review_date: D(pick([90, 180, 365])) as any,
    auto_priority: risk,
    target_pass: 4,
    pass1_complete: true,
    status: 'active',
    organization_id: orgId,
  }
}

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const repo = ds.getRepository(RopaActivity)

  let created = 0
  for (let i = 1; i <= 100; i++) {
    const code = `ROPA-${String(i).padStart(4, '0')}`
    if (await repo.findOne({ where: { ropa_code: code } })) continue
    await repo.save(repo.create(buildRecord(i, org.id) as any))
    created++
    if (created % 20 === 0) console.log(`  ... ${created} created`)
  }
  console.log(`  ✓ ROPA bulk: ${created} records created`)
  await ds.destroy()
  console.log('✅ ROPA bulk seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
