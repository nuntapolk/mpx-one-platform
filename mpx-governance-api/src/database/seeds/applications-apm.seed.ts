import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { Application } from '../entities/application.entity'
import { RopaActivity } from '../entities/ropa.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Application, RopaActivity, Organization],
})
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const D = (d: number) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }

const BCG = ['invest', 'tolerate', 'migrate', 'eliminate']
const EA_GROUP = ['1. Direction', '2. Services', '3. Core Products', '4. Support', '5. Governance']
const SUPPORT = ['Inhouse', 'Vendor', 'Hybrid']
const OS = ['Linux RHEL', 'Windows Server', 'Cloud-managed']
const DBP = ['PostgreSQL', 'Oracle', 'MS SQL', 'MongoDB']
const SVC = ['24x7', 'Business Hours', '16x5']

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const appRepo = ds.getRepository(Application)
  const ropaRepo = ds.getRepository(RopaActivity)

  const apps = await appRepo.find({ where: { organization_id: o } })
  let updated = 0
  for (const a of apps) {
    const techDebt = ri(10, 90)
    await appRepo.update({ id: a.id }, {
      bcg_classification: pick(BCG),
      health_score: ri(40, 95),
      tech_debt_score: techDebt,
      tco_annual: ri(2, 80) * 100000,
      strategic_value: ri(30, 95),
      users_count: ri(20, 5000),
      eol_date: Math.random() < 0.4 ? D(ri(60, 900)) : null as any,
      contract_end_date: Math.random() < 0.5 ? D(ri(30, 700)) : null as any,
      assess_status: pick(['not_started', 'in_progress', 'completed']),
      migration_wave: ri(1, 4),
      dr_enabled: Math.random() < 0.6,
      service_hours: pick(SVC),
      support_model: pick(SUPPORT),
      os_platform: pick(OS),
      db_platform: pick(DBP),
      ea_group: pick(EA_GROUP),
    } as any)
    updated++
  }
  console.log(`  ✓ APM fields backfilled: ${updated} applications`)

  // Link some ROPA records to applications (for 360 demo)
  if (apps.length) {
    const ropas = await ropaRepo.find({ where: { organization_id: o }, take: 60 })
    let linked = 0
    for (const r of ropas) {
      if (Math.random() < 0.6) {
        await ropaRepo.update({ id: r.id }, { related_application_id: pick(apps).id })
        linked++
      }
    }
    console.log(`  ✓ ROPA linked to applications: ${linked}`)
  }

  await ds.destroy()
  console.log('✅ Applications APM seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
