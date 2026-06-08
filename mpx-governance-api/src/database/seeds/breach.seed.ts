import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { BreachIncident } from '../entities/breach-incident.entity'
import { BreachTimeline } from '../entities/breach-timeline.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [BreachIncident, BreachTimeline, Organization],
})
const H = (h: number) => new Date(Date.now() + h * 36e5)

const BREACHES = [
  { incident_number: 'BR-2026-0001', title: 'Email phishing — รั่วข้อมูลลูกค้า 500 ราย', breach_type: 'confidentiality', severity: 'high', status: 'investigating', discovered_at: H(-24), affected_count: 500, includes_sensitive_data: false, requires_pdpc_notification: true, pdpc_notification_deadline: H(48), requires_subject_notification: true, description: 'พนักงานถูก phishing ทำให้ข้อมูลลูกค้ารั่ว' },
  { incident_number: 'BR-2026-0002', title: 'Ransomware — ระบบ HR', breach_type: 'availability', severity: 'critical', status: 'contained', discovered_at: H(-60), affected_count: 1200, includes_sensitive_data: true, requires_pdpc_notification: true, pdpc_notification_deadline: H(12), requires_subject_notification: true, description: 'Ransomware เข้ารหัสข้อมูลพนักงาน' },
  { incident_number: 'BR-2026-0003', title: 'Misconfigured S3 bucket', breach_type: 'confidentiality', severity: 'medium', status: 'resolved', discovered_at: H(-200), affected_count: 50, includes_sensitive_data: false, requires_pdpc_notification: false, pdpc_notified_at: H(-180), description: 'S3 bucket เปิด public โดยไม่ตั้งใจ' },
  { incident_number: 'BR-2026-0004', title: 'Insider — ดาวน์โหลดข้อมูลลูกค้า', breach_type: 'confidentiality', severity: 'high', status: 'reported', discovered_at: H(-90), affected_count: 300, includes_sensitive_data: true, requires_pdpc_notification: true, pdpc_notification_deadline: H(-18), requires_subject_notification: true, description: 'พนักงานเก่าดาวน์โหลดข้อมูลก่อนลาออก' },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const repo = ds.getRepository(BreachIncident)
  const tlRepo = ds.getRepository(BreachTimeline)
  let n = 0
  for (const b of BREACHES) {
    const ex = await repo.findOne({ where: { incident_number: b.incident_number } })
    if (!ex) {
      const saved: any = await repo.save(repo.create({ ...b, organization_id: org.id } as any))
      await tlRepo.save(tlRepo.create({ breach_incident_id: saved.id, action: 'created', description: 'รายงานเหตุละเมิด', user_name: 'seed' }))
      n++
    }
  }
  console.log(`  ✓ Breach incidents: ${n}`)
  await ds.destroy()
  console.log('✅ Breach seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
