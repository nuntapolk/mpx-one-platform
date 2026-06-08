import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { PrivacyNotice } from '../entities/privacy-notice.entity'
import { RetentionSchedule } from '../entities/retention-schedule.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [PrivacyNotice, RetentionSchedule, Organization],
})
const D = (days: number) => new Date(Date.now() + days * 864e5)

const NOTICES = [
  { type: 'website', title: 'นโยบายความเป็นส่วนตัว — เว็บไซต์', language: 'th', version: '3.0', is_active: true, published_at: D(-120), effective_date: D(-120), public_url: 'https://example.com/privacy' },
  { type: 'recruitment', title: 'ประกาศความเป็นส่วนตัวสำหรับผู้สมัครงาน', language: 'th', version: '1.2', is_active: true, published_at: D(-60), effective_date: D(-60) },
  { type: 'cctv', title: 'ประกาศการใช้กล้องวงจรปิด', language: 'th', version: '1.0', is_active: true, published_at: D(-200), effective_date: D(-200), expires_at: D(-10) },
  { type: 'mobile_app', title: 'Privacy Notice — Mobile App (EN)', language: 'en', version: '2.0', is_active: false },
]

const RETENTION = [
  { data_category: 'ข้อมูลลูกค้า (Customer Master)', retention_years: 10, legal_basis: 'พ.ร.บ.การบัญชี + PDPA' },
  { data_category: 'ข้อมูลธุรกรรมการเงิน', retention_years: 10, legal_basis: 'พ.ร.บ.ป้องกันและปราบปรามการฟอกเงิน' },
  { data_category: 'ข้อมูลพนักงาน', retention_years: 5, legal_basis: 'พ.ร.บ.คุ้มครองแรงงาน' },
  { data_category: 'ข้อมูลผู้สมัครงาน (ไม่ผ่าน)', retention_years: 1, legal_basis: 'ความยินยอม' },
  { data_category: 'CCTV Footage', retention_years: 1, legal_basis: 'ประโยชน์โดยชอบด้วยกฎหมาย', notes: 'เก็บ 30-90 วันสำหรับ footage ทั่วไป' },
  { data_category: 'Marketing Consent Records', retention_years: 3, legal_basis: 'ความยินยอม' },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const nRepo = ds.getRepository(PrivacyNotice)
  const rRepo = ds.getRepository(RetentionSchedule)
  let n1 = 0, n2 = 0
  for (const x of NOTICES) {
    const ex = await nRepo.findOne({ where: { organization_id: org.id, title: x.title } })
    if (!ex) { await nRepo.save(nRepo.create({ ...x, organization_id: org.id } as any)); n1++ }
  }
  for (const x of RETENTION) {
    const ex = await rRepo.findOne({ where: { organization_id: org.id, data_category: x.data_category } })
    if (!ex) { await rRepo.save(rRepo.create({ ...x, organization_id: org.id, is_active: true } as any)); n2++ }
  }
  console.log(`  ✓ Privacy notices: ${n1}, Retention schedules: ${n2}`)
  await ds.destroy()
  console.log('✅ Privacy seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
