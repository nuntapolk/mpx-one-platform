import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { Lookup } from '../entities/lookup.entity'
import { RopaFieldConfig } from '../entities/ropa-field-config.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Lookup, RopaFieldConfig, Organization],
})

const PERSONAL_DATA_TYPES = [
  ['name', 'ชื่อ-นามสกุล'], ['national_id', 'เลขบัตรประชาชน'], ['address', 'ที่อยู่'],
  ['phone', 'เบอร์โทรศัพท์'], ['email', 'อีเมล'], ['dob', 'วันเดือนปีเกิด'],
  ['financial', 'ข้อมูลทางการเงิน'], ['bank_account', 'เลขบัญชีธนาคาร'],
  ['health', 'ข้อมูลสุขภาพ (อ่อนไหว)'], ['biometric', 'ข้อมูลชีวมิติ (อ่อนไหว)'],
  ['religion', 'ศาสนา (อ่อนไหว)'], ['criminal', 'ประวัติอาชญากรรม (อ่อนไหว)'],
]
const DATA_SUBJECT_TYPES = [
  ['customer', 'ลูกค้า'], ['employee', 'พนักงาน'], ['applicant', 'ผู้สมัครงาน'],
  ['shareholder', 'ผู้ถือหุ้น'], ['partner', 'คู่ค้า'], ['visitor', 'ผู้เยี่ยมชม'],
  ['vendor', 'ผู้ขาย/ผู้ให้บริการ'], ['minor', 'ผู้เยาว์'],
]
const FIELD_CONFIGS = [
  { field_key: 'data_classification', field_label: 'ระดับชั้นความลับข้อมูล', field_type: 'select', section: 'general', sort_order: 1, is_required: false,
    field_options: [{ value: 'public', label: 'สาธารณะ' }, { value: 'internal', label: 'ภายใน' }, { value: 'confidential', label: 'ลับ' }, { value: 'restricted', label: 'ลับมาก' }] },
  { field_key: 'business_owner', field_label: 'เจ้าของเชิงธุรกิจ', field_type: 'text', section: 'general', sort_order: 2, is_required: false },
  { field_key: 'review_frequency', field_label: 'รอบการทบทวน', field_type: 'select', section: 'governance', sort_order: 1, is_required: false,
    field_options: [{ value: 'quarterly', label: 'ทุกไตรมาส' }, { value: 'semi_annual', label: 'ทุกครึ่งปี' }, { value: 'annual', label: 'ทุกปี' }] },
  { field_key: 'automated_decision', field_label: 'มีการตัดสินใจอัตโนมัติ', field_type: 'checkbox', section: 'governance', sort_order: 2, is_required: false, help_text: 'ระบุหากมีการประมวลผลแบบอัตโนมัติที่มีผลต่อเจ้าของข้อมูล' },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const lk = ds.getRepository(Lookup)
  const fc = ds.getRepository(RopaFieldConfig)

  let lc = 0
  const addLookups = async (category: string, items: string[][]) => {
    for (let i = 0; i < items.length; i++) {
      const [value, label] = items[i]
      if (await lk.findOne({ where: { organization_id: o, category, value } })) continue
      await lk.save(lk.create({ organization_id: o, category, value, label, display_order: i, is_active: true, is_builtin: true } as any))
      lc++
    }
  }
  await addLookups('personal_data_type', PERSONAL_DATA_TYPES)
  await addLookups('data_subject_type', DATA_SUBJECT_TYPES)
  console.log(`  ✓ Lookups (data types): ${lc} created`)

  let fcCount = 0
  for (const f of FIELD_CONFIGS) {
    if (await fc.findOne({ where: { organization_id: o, field_key: f.field_key } })) continue
    await fc.save(fc.create({ ...f, organization_id: o, is_active: true } as any))
    fcCount++
  }
  console.log(`  ✓ ROPA field configs: ${fcCount} created`)

  await ds.destroy()
  console.log('✅ Master data seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
