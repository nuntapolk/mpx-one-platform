import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { DpoTask } from '../entities/dpo-task.entity'
import { CookieBannerSetting } from '../entities/cookie-banner.entity'
import { CookieConsent } from '../entities/cookie-consent.entity'
import { TrainingCourse } from '../entities/training-course.entity'
import { ExternalParty } from '../entities/external-party.entity'
import { DataProcessingAgreement } from '../entities/dpa.entity'
import { RopaCampaign } from '../entities/ropa-campaign.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [DpoTask, CookieBannerSetting, CookieConsent, TrainingCourse, ExternalParty, DataProcessingAgreement, RopaCampaign, Organization],
})
const D = (d: number) => new Date(Date.now() + d * 864e5)

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id

  const dpo = ds.getRepository(DpoTask)
  for (const t of [
    { title: 'ทบทวน ROPA ประจำไตรมาส', category: 'review', priority: 'high', status: 'pending', due_date: D(7) },
    { title: 'ตอบคำขอ DSAR #048', category: 'dsar', priority: 'critical', status: 'in_progress', due_date: D(2) },
    { title: 'จัดอบรม PDPA พนักงานใหม่', category: 'training', priority: 'medium', status: 'pending', due_date: D(14) },
    { title: 'ตรวจสอบ DPA กับ vendor', category: 'audit', priority: 'high', status: 'completed', due_date: D(-3) },
  ]) if (!await dpo.findOne({ where: { organization_id: o, title: t.title } })) await dpo.save(dpo.create({ ...t, organization_id: o } as any))
  console.log('  ✓ DPO tasks')

  const banner = ds.getRepository(CookieBannerSetting)
  let b: any = await banner.findOne({ where: { organization_id: o, name: 'Default Banner' } })
  if (!b) b = await banner.save(banner.create({
    organization_id: o, name: 'Default Banner', is_active: true, banner_title: 'เราใช้คุกกี้',
    banner_description: 'เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน',
    categories: [{ key: 'necessary', label: 'จำเป็น', required: true }, { key: 'analytics', label: 'วิเคราะห์', required: false }, { key: 'marketing', label: 'การตลาด', required: false }],
    position: 'bottom', consent_duration_days: 365,
  } as any))
  const cc = ds.getRepository(CookieConsent)
  const samples = [
    { action: 'accept_all', accepted_categories: ['necessary','analytics','marketing'] },
    { action: 'accept_all', accepted_categories: ['necessary','analytics','marketing'] },
    { action: 'reject_all', accepted_categories: ['necessary'], rejected_categories: ['analytics','marketing'] },
    { action: 'custom', accepted_categories: ['necessary','analytics'], rejected_categories: ['marketing'] },
  ]
  if ((await cc.count({ where: { organization_id: o } })) === 0)
    for (const s of samples) await cc.save(cc.create({ ...s, organization_id: o, banner_setting_id: b!.id, channel: 'web', consented_at: new Date(), expires_at: D(365) } as any))
  console.log('  ✓ Cookie banner + consents')

  const tr = ds.getRepository(TrainingCourse)
  for (const t of [
    { title: 'PDPA พื้นฐานสำหรับพนักงาน', duration_minutes: 60, is_required: true, passing_score: 80, certificate_enabled: true, validity_months: 12, is_active: true },
    { title: 'Data Security Awareness', duration_minutes: 45, is_required: true, passing_score: 70, is_active: true },
    { title: 'การจัดการ DSAR สำหรับทีม CS', duration_minutes: 30, is_required: false, passing_score: 75, is_active: true },
  ]) if (!await tr.findOne({ where: { organization_id: o, title: t.title } })) await tr.save(tr.create({ ...t, organization_id: o } as any))
  console.log('  ✓ Training courses')

  const ep = ds.getRepository(ExternalParty)
  const eps = [
    { code: 'EP-2026-0001', name: 'AWS (Cloud Hosting)', type: 'processor', country: 'USA', risk_level: 'high', is_cross_border: true, tia_required: true, contact_email: 'dpo@aws.com' },
    { code: 'EP-2026-0002', name: 'Mailchimp', type: 'processor', country: 'USA', risk_level: 'medium', is_cross_border: true, tia_required: true },
    { code: 'EP-2026-0003', name: 'Local Payroll Co.', type: 'processor', country: 'Thailand', risk_level: 'medium', is_cross_border: false },
  ]
  const epIds: Record<string,string> = {}
  for (const e of eps) {
    let x = await ep.findOne({ where: { code: e.code } })
    if (!x) x = await ep.save(ep.create({ ...e, organization_id: o } as any)) as any
    epIds[e.code] = (x as any).id
  }
  console.log('  ✓ External parties')

  const dpa = ds.getRepository(DataProcessingAgreement)
  for (const d of [
    { dpa_number: 'DPA-2026-0001', title: 'DPA — AWS', external_party_id: epIds['EP-2026-0001'], status: 'active', our_role: 'controller', their_role: 'processor', signed_at: D(-100), expires_at: D(265), audit_rights: true, breach_notification_hours: 72 },
    { dpa_number: 'DPA-2026-0002', title: 'DPA — Mailchimp', external_party_id: epIds['EP-2026-0002'], status: 'pending_signature', our_role: 'controller', their_role: 'processor' },
  ]) if (!await dpa.findOne({ where: { dpa_number: d.dpa_number } })) await dpa.save(dpa.create({ ...d, organization_id: o } as any))
  console.log('  ✓ DPAs')

  const camp = ds.getRepository(RopaCampaign)
  for (const c of [
    { name: 'ROPA Collection Q3/2026', mode: 'collect', status: 'active', campaign_token: 'camp-' + Math.random().toString(36).slice(2,10), deadline: D(30), require_employee_id: true },
  ]) if (!await camp.findOne({ where: { organization_id: o, name: c.name } })) await camp.save(camp.create({ ...c, organization_id: o } as any))
  console.log('  ✓ ROPA campaign')

  await ds.destroy()
  console.log('✅ PDPA extra seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
