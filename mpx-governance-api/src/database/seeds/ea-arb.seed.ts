import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { EaCapability } from '../entities/ea-capability.entity'
import { EaCapabilityMap } from '../entities/ea-capability-map.entity'
import { ArbRequest } from '../entities/arb-request.entity'
import { Application } from '../entities/application.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [EaCapability, EaCapabilityMap, ArbRequest, Application, Organization],
})
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

const CAPS: [string, string, string, string][] = [
  // domain, code, name, tier
  ['business', 'BC-01', 'Customer Management', 'core'],
  ['business', 'BC-02', 'Product Management', 'core'],
  ['business', 'BC-03', 'Order & Fulfilment', 'core'],
  ['business', 'BC-04', 'Finance & Accounting', 'supporting'],
  ['business', 'BC-05', 'Human Resources', 'supporting'],
  ['business', 'BC-06', 'Risk & Compliance', 'core'],
  ['application', 'AC-01', 'CRM', 'core'],
  ['application', 'AC-02', 'ERP', 'core'],
  ['application', 'AC-03', 'Core Banking', 'core'],
  ['application', 'AC-04', 'Identity & Access Mgmt', 'supporting'],
  ['application', 'AC-05', 'Reporting & BI', 'supporting'],
  ['data', 'DC-01', 'Customer Data Domain', 'core'],
  ['data', 'DC-02', 'Product Data Domain', 'core'],
  ['data', 'DC-03', 'Transaction Data Domain', 'core'],
  ['data', 'DC-04', 'Master Data Management', 'supporting'],
  ['technology', 'TC-01', 'Cloud Platform', 'core'],
  ['technology', 'TC-02', 'API Gateway / Integration', 'core'],
  ['technology', 'TC-03', 'Container Orchestration', 'supporting'],
  ['technology', 'TC-04', 'Observability / Monitoring', 'supporting'],
  ['security', 'SC-01', 'IAM & PAM', 'core'],
  ['security', 'SC-02', 'Data Encryption', 'core'],
  ['security', 'SC-03', 'SIEM / Threat Detection', 'supporting'],
]
const COV = ['full', 'partial', 'planned']
const ARB_TYPES = ['new_app', 'change', 'exception', 'tech_selection']
const ARB_TITLES = [
  'อนุมัติย้าย Core Banking ขึ้น Cloud', 'ขอใช้ tech stack ใหม่ (Kubernetes)',
  'ขอยกเว้นมาตรฐานการเข้ารหัสชั่วคราว', 'เลือก vendor API Gateway',
  'เปลี่ยนสถาปัตยกรรม CRM เป็น microservices', 'อนุมัติระบบ Reporting ใหม่',
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const capRepo = ds.getRepository(EaCapability)
  const mapRepo = ds.getRepository(EaCapabilityMap)
  const arbRepo = ds.getRepository(ArbRequest)
  const apps = await ds.getRepository(Application).find({ where: { organization_id: o } })

  let created = 0
  const savedCaps: EaCapability[] = []
  for (const [domain, code, name, tier] of CAPS) {
    let c = await capRepo.findOne({ where: { organization_id: o, code } })
    if (!c) { c = await capRepo.save(capRepo.create({ organization_id: o, domain, code, name, tier, level: 'L1', status: 'active' } as any)) as any; created++ }
    savedCaps.push(c!)
  }
  console.log(`  ✓ EA capabilities: ${created} created`)

  // coverage mapping (leave ~25% as gaps)
  let mapped = 0
  if (apps.length && (await mapRepo.count({ where: { organization_id: o } })) === 0) {
    for (const c of savedCaps) {
      if (Math.random() < 0.75) {
        const n = 1 + Math.floor(Math.random() * 2)
        for (let i = 0; i < n; i++) {
          await mapRepo.save(mapRepo.create({ organization_id: o, capability_id: c.id, application_id: pick(apps).id, coverage_level: pick(COV), role: pick(['primary', 'secondary']) } as any))
          mapped++
        }
      }
    }
  }
  console.log(`  ✓ Coverage mappings: ${mapped}`)

  // ARB requests
  if ((await arbRepo.count({ where: { organization_id: o } })) === 0) {
    const year = 2026
    for (let i = 0; i < ARB_TITLES.length; i++) {
      const status = pick(['submitted', 'in_review', 'approved', 'conditional', 'rejected'])
      await arbRepo.save(arbRepo.create({
        organization_id: o, arb_number: `ARB-${year}-${String(i + 1).padStart(3, '0')}`,
        title: ARB_TITLES[i], request_type: pick(ARB_TYPES), risk_level: pick(['critical', 'high', 'medium', 'low']),
        status, application_id: apps.length ? pick(apps).id : null, requested_by: pick(['EA Team', 'IT Dept', 'Solution Architect']),
        reviewers: ['Chief Architect', 'Security Lead'],
        findings: status !== 'submitted' ? [{ type: 'risk', severity: 'medium', text: 'ต้องประเมิน impact ต่อระบบเดิม' }] : [],
        decision: ['approved', 'conditional', 'rejected'].includes(status) ? 'พิจารณาแล้วตามมติ ARB' : null,
        decided_at: ['approved', 'conditional', 'rejected'].includes(status) ? new Date() : null,
      } as any))
    }
    console.log(`  ✓ ARB requests: ${ARB_TITLES.length} created`)
  }

  await ds.destroy()
  console.log('✅ EA + ARB seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
