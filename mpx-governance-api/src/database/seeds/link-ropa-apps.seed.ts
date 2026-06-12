import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { RopaActivity } from '../entities/ropa.entity'
import { Application } from '../entities/application.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [RopaActivity, Application, Organization],
})
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const apps = await ds.getRepository(Application).find({ where: { organization_id: o } })
  const ropaRepo = ds.getRepository(RopaActivity)
  const unlinked = await ropaRepo.find({ where: { organization_id: o, related_application_id: null as any } })
  let n = 0
  for (const r of unlinked) { await ropaRepo.update({ id: r.id }, { related_application_id: pick(apps).id }); n++ }
  console.log(`  ✓ linked ${n} ROPA → applications`)
  await ds.destroy()
  console.log('✅ ROPA↔app link seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
