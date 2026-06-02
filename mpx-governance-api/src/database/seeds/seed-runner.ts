import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { FRAMEWORK_SEED } from './frameworks.seed'
import { CONTROL_SEED } from './controls.seed'
import { CONTROL_MAPPING_SEED } from './control-mappings.seed'
import { GOVERNANCE_DOMAIN_SEED } from './governance-domains.seed'

import { Framework } from '../entities/framework.entity'
import { Control } from '../entities/control.entity'
import { ControlMapping } from '../entities/control-mapping.entity'
import { GovernanceDomain } from '../entities/governance-domain.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5433/mpx_one',
  synchronize: false,
  entities: [Framework, Control, ControlMapping, GovernanceDomain, Organization],
})

async function run() {
  await ds.initialize()
  console.log('Connected to DB')

  const fwRepo   = ds.getRepository(Framework)
  const ctlRepo  = ds.getRepository(Control)
  const mapRepo  = ds.getRepository(ControlMapping)
  const domRepo  = ds.getRepository(GovernanceDomain)
  const orgRepo  = ds.getRepository(Organization)

  // ── Ensure default org exists ──────────────────────────────────
  let org = await orgRepo.findOne({ where: { slug: 'default' } })
  if (!org) {
    org = await orgRepo.save(orgRepo.create({
      name: 'MPX-ONE Default Org',
      slug: 'default',
      plan: 'enterprise',
    }))
    console.log('Created default organization')
  }
  const orgId = org.id

  // ── Governance Domains ─────────────────────────────────────────
  for (const d of GOVERNANCE_DOMAIN_SEED) {
    const existing = await domRepo.findOne({ where: { organization_id: orgId, code: d.code } })
    if (!existing) {
      await domRepo.save(domRepo.create({ ...d, organization_id: orgId }))
      console.log(`  ✓ Domain: ${d.name}`)
    }
  }

  // ── Frameworks ─────────────────────────────────────────────────
  const fwMap: Record<string, string> = {} // framework_id → uuid
  for (const fw of FRAMEWORK_SEED) {
    let existing = await fwRepo.findOne({ where: { framework_id: fw.framework_id } })
    if (!existing) {
      existing = await fwRepo.save(fwRepo.create({
        ...fw,
        organization_id: orgId,
        is_builtin: true,
        effective_date: fw.effective_date ? new Date(fw.effective_date) as any : null,
      }))
      console.log(`  ✓ Framework: ${fw.name}`)
    }
    fwMap[fw.framework_id] = existing.id
  }

  // ── Controls ───────────────────────────────────────────────────
  const ctlMap: Record<string, string> = {} // control_id → uuid
  for (const ctl of CONTROL_SEED) {
    let existing = await ctlRepo.findOne({ where: { control_id: ctl.control_id } })
    if (!existing) {
      existing = await ctlRepo.save(ctlRepo.create({
        ...ctl,
        organization_id: orgId,
        is_builtin: true,
      }))
      console.log(`  ✓ Control: ${ctl.control_id} — ${ctl.name}`)
    }
    ctlMap[ctl.control_id] = existing.id
  }

  // ── Control Mappings ───────────────────────────────────────────
  let mappingCount = 0
  for (const m of CONTROL_MAPPING_SEED) {
    const controlUUID  = ctlMap[m.control_id]
    const frameworkUUID = fwMap[m.framework_id]

    if (!controlUUID || !frameworkUUID) {
      console.warn(`  ⚠ Skip mapping: ${m.control_id} → ${m.framework_id} (not found)`)
      continue
    }

    const existing = await mapRepo.findOne({
      where: { control_id: controlUUID, framework_id: frameworkUUID },
    })
    if (!existing) {
      await mapRepo.save(mapRepo.create({
        ...m,
        control_id:   controlUUID,
        framework_id: frameworkUUID,
        obligation_id: frameworkUUID, // placeholder — will be refined when obligations are seeded
        organization_id: orgId,
      }))
      mappingCount++
    }
  }
  console.log(`  ✓ Control mappings: ${mappingCount} created`)

  await ds.destroy()
  console.log('\n✅ Seed completed successfully!')
}

run().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
