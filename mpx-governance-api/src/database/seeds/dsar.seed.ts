import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { RightsRequest } from '../entities/rights-request.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [RightsRequest, Organization],
})

const D = (days: number) => new Date(Date.now() + days * 864e5)

const REQS = [
  { ticket_number: 'DSAR-2026-0001', type: 'access', status: 'completed', requester_name: 'สมชาย ใจดี', requester_email: 'somchai@example.com', description: 'ขอสำเนาข้อมูลส่วนบุคคลทั้งหมด', due_date: D(-5), submitted_at: D(-35), completed_at: D(-2) },
  { ticket_number: 'DSAR-2026-0002', type: 'erasure', status: 'in_review', requester_name: 'สุดา รักดี', requester_email: 'suda@example.com', description: 'ขอลบข้อมูลทั้งหมด', due_date: D(2), submitted_at: D(-28) },
  { ticket_number: 'DSAR-2026-0003', type: 'rectification', status: 'pending', requester_name: 'วิชัย มั่นคง', requester_email: 'wichai@example.com', description: 'ขอแก้ไขที่อยู่', due_date: D(20), submitted_at: D(-10) },
  { ticket_number: 'DSAR-2026-0004', type: 'objection', status: 'awaiting_info', requester_name: 'นภา สดใส', requester_email: 'napha@example.com', description: 'คัดค้านการประมวลผลเพื่อการตลาด', due_date: D(-3), submitted_at: D(-33) },
  { ticket_number: 'DSAR-2026-0005', type: 'portability', status: 'pending', requester_name: 'ก้อง ทองดี', requester_email: 'kong@example.com', description: 'ขอโอนย้ายข้อมูลไปผู้ให้บริการอื่น', due_date: D(6), submitted_at: D(-24) },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const repo = ds.getRepository(RightsRequest)
  let n = 0
  for (const r of REQS) {
    const ex = await repo.findOne({ where: { ticket_number: r.ticket_number } })
    if (!ex) { await repo.save(repo.create({ ...r, organization_id: org.id } as any)); n++ }
  }
  console.log(`  ✓ DSAR requests: ${n}`)
  await ds.destroy()
  console.log('✅ DSAR seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
