import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import { AppUser } from '../entities/app-user.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [AppUser, Organization],
})

const USERS = [
  { email: 'admin@mpx.local', name: 'Admin User', roles: ['admin'] },
  { email: 'dpo@mpx.local', name: 'DPO User', roles: ['dpo'] },
]

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const repo = ds.getRepository(AppUser)
  let created = 0
  for (const u of USERS) {
    if (await repo.findOne({ where: { email: u.email } })) continue
    await repo.save(repo.create({ ...u, organization_id: org.id, is_active: true } as any))
    created++
  }
  console.log(`  ✓ App users: ${created} created (mapped to default org)`)
  await ds.destroy()
  console.log('✅ App users seed completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
