import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { Consent } from '../entities/consent.entity'
import { ConsentTemplate } from '../entities/consent-template.entity'
import { DataSubject } from '../entities/data-subject.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Consent, ConsentTemplate, DataSubject, Organization],
})

const TEMPLATES = [
  { name: 'การตลาดและโปรโมชั่น', purpose: 'ส่งข้อมูลโปรโมชั่นและข่าวสารการตลาด', legal_basis: 'ความยินยอม (มาตรา 24)', retention_days: 1095, is_sensitive: false, requires_explicit_consent: true, status: 'active' },
  { name: 'การวิเคราะห์พฤติกรรม', purpose: 'วิเคราะห์พฤติกรรมเพื่อปรับปรุงบริการ', legal_basis: 'ความยินยอม (มาตรา 24)', retention_days: 730, is_sensitive: false, requires_explicit_consent: true, status: 'active' },
  { name: 'แชร์ข้อมูลกับพันธมิตร', purpose: 'ส่งต่อข้อมูลให้บริษัทในเครือ', legal_basis: 'ความยินยอม (มาตรา 27)', retention_days: 365, is_sensitive: true, requires_explicit_consent: true, status: 'active' },
  { name: 'ข้อมูลสุขภาพ (Sensitive)', purpose: 'ประมวลผลข้อมูลสุขภาพสำหรับบริการประกัน', legal_basis: 'ความยินยอมโดยชัดแจ้ง (มาตรา 26)', retention_days: 1825, is_sensitive: true, requires_explicit_consent: true, status: 'active' },
]

const SUBJECTS = [
  { type: 'customer', first_name: 'สมชาย', last_name: 'ใจดี', email: 'somchai@example.com', phone: '0811111111' },
  { type: 'customer', first_name: 'สุดา', last_name: 'รักดี', email: 'suda@example.com', phone: '0822222222' },
  { type: 'customer', first_name: 'วิชัย', last_name: 'มั่นคง', email: 'wichai@example.com', phone: '0833333333' },
  { type: 'employee', first_name: 'นภา', last_name: 'สดใส', email: 'napha@example.com', phone: '0844444444' },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const orgId = org.id

  const tmplRepo = ds.getRepository(ConsentTemplate)
  const subjRepo = ds.getRepository(DataSubject)
  const conRepo  = ds.getRepository(Consent)

  const tmplIds: string[] = []
  for (const t of TEMPLATES) {
    let ex = await tmplRepo.findOne({ where: { organization_id: orgId, name: t.name } })
    if (!ex) ex = await tmplRepo.save(tmplRepo.create({ ...t, organization_id: orgId }))
    tmplIds.push(ex.id)
  }
  console.log(`  ✓ Templates: ${tmplIds.length}`)

  const subjIds: string[] = []
  let i = 1
  for (const s of SUBJECTS) {
    const ref = `DS-2026-${String(i).padStart(4, '0')}`
    let ex = await subjRepo.findOne({ where: { reference_id: ref } })
    if (!ex) ex = await subjRepo.save(subjRepo.create({ ...s, reference_id: ref, organization_id: orgId, status: 'active' }))
    subjIds.push(ex.id); i++
  }
  console.log(`  ✓ Subjects: ${subjIds.length}`)

  // Consents: mix of granted / withdrawn / expired
  const now = new Date()
  const future = new Date(Date.now() + 365 * 864e5)
  const past = new Date(Date.now() - 30 * 864e5)
  const samples = [
    { data_subject_id: subjIds[0], template_id: tmplIds[0], granted: true, channel: 'web', granted_at: now, expires_at: future },
    { data_subject_id: subjIds[0], template_id: tmplIds[1], granted: true, channel: 'mobile', granted_at: now, expires_at: future },
    { data_subject_id: subjIds[1], template_id: tmplIds[0], granted: true, channel: 'web', granted_at: now, expires_at: future },
    { data_subject_id: subjIds[1], template_id: tmplIds[2], granted: false, channel: 'web', withdrawn_at: now, withdrawal_reason: 'ลูกค้าขอถอน' },
    { data_subject_id: subjIds[2], template_id: tmplIds[0], granted: true, channel: 'paper', granted_at: past, expires_at: past },
    { data_subject_id: subjIds[3], template_id: tmplIds[3], granted: true, channel: 'web', granted_at: now, expires_at: future },
  ]
  let n = 0
  for (const c of samples) {
    await conRepo.save(conRepo.create({ ...c, organization_id: orgId } as any))
    n++
  }
  console.log(`  ✓ Consents: ${n}`)

  await ds.destroy()
  console.log('✅ Consent seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
