import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { AccessReview } from '../entities/access-review.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [AccessReview, Organization],
})
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const D = (d: number) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }

const USERS = ['สมชาย ใจดี', 'สุดา รักงาน', 'ประยุทธ มั่นคง', 'วิภา สดใส', 'ก้องเกียรติ ทองคำ', 'นภา แสงทอง']
const REVIEWERS = ['DPO Office', 'IT Security', 'หัวหน้าฝ่าย HR', 'ผู้จัดการ IT']
const SYSTEMS = ['Core Banking System', 'CRM Salesforce', 'HR Workday', 'Data Warehouse', 'Mobile App Backend', 'Loan Origination']
const LEVELS = ['read', 'write', 'admin', 'full']
const SCOPES = ['ข้อมูลลูกค้าทั้งหมด', 'ข้อมูลพนักงานในแผนก', 'รายงานการเงิน', 'ข้อมูล PII ระดับสูง', 'ระบบ config']

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const repo = ds.getRepository(AccessReview)
  const cycle = '2026-Q2'

  let created = 0
  for (let i = 1; i <= 24; i++) {
    const user = pick(USERS)
    if (await repo.findOne({ where: { organization_id: org.id, review_cycle: cycle, user_under_review_name: user, system_name: SYSTEMS[i % SYSTEMS.length] } })) continue
    // 60% pending (some overdue), 40% completed with a decision
    const completed = Math.random() < 0.4
    const decision = completed ? pick(['retain', 'modify', 'revoke']) : 'pending'
    const overdue = !completed && Math.random() < 0.4
    await repo.save(repo.create({
      organization_id: org.id,
      review_cycle: cycle,
      reviewer_name: pick(REVIEWERS),
      user_under_review_name: user,
      system_name: SYSTEMS[i % SYSTEMS.length],
      access_level: pick(LEVELS),
      access_scope: pick(SCOPES),
      decision,
      status: completed ? 'completed' : 'pending',
      reviewed_at: completed ? new Date() : null,
      justification: completed ? (decision === 'revoke' ? 'ไม่มีความจำเป็นต้องเข้าถึงแล้ว' : 'ยังจำเป็นต่อการปฏิบัติงาน') : null,
      due_date: overdue ? D(-pick([3, 7, 14])) : D(pick([7, 14, 30])),
      notes: 'ทบทวนสิทธิ์เข้าถึงตามรอบไตรมาส',
    } as any))
    created++
  }
  console.log(`  ✓ Access reviews: ${created} created`)
  await ds.destroy()
  console.log('✅ Access review seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
