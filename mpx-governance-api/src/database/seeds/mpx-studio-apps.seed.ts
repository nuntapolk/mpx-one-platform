import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import * as fs from 'fs'
import * as path from 'path'
import { Application } from '../entities/application.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [Application, Organization],
})

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const repo = ds.getRepository(Application)

  const apps: any[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mpx-studio-apps.json'), 'utf8'))
  let created = 0, skipped = 0
  const base = await repo.count({ where: { organization_id: o } })
  let n = base
  for (const a of apps) {
    if (await repo.findOne({ where: { organization_id: o, application_name: a.application_name } })) { skipped++; continue }
    n++
    await repo.save(repo.create({
      ...a,
      organization_id: o,
      application_code: `APP-IMP-${String(n).padStart(3, '0')}`,
      status: 'active',
    } as any))
    created++
  }
  console.log(`  ✓ MPX Studio apps imported: ${created} created, ${skipped} skipped (already exists)`)
  await ds.destroy()
  console.log('✅ MPX Studio apps seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
