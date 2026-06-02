import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

import { FRAMEWORK_SEED } from './frameworks.seed'
import { CONTROL_SEED } from './controls.seed'
import { CONTROL_MAPPING_SEED } from './control-mappings.seed'
import { GOVERNANCE_DOMAIN_SEED } from './governance-domains.seed'
import { ASSESSMENT_TEMPLATE_SEED } from './assessment-templates.seed'

import { Framework } from '../entities/framework.entity'
import { Control } from '../entities/control.entity'
import { ControlMapping } from '../entities/control-mapping.entity'
import { GovernanceDomain } from '../entities/governance-domain.entity'
import { Organization } from '../entities/organization.entity'
import { AssessmentTemplate } from '../entities/assessment-template.entity'
import { AssessmentTemplateControl } from '../entities/assessment-template-control.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5433/mpx_one',
  synchronize: false,
  entities: [
    Framework, Control, ControlMapping, GovernanceDomain,
    Organization, AssessmentTemplate, AssessmentTemplateControl,
  ],
})

async function run() {
  await ds.initialize()
  console.log('Connected to DB')

  const fwRepo   = ds.getRepository(Framework)
  const ctlRepo  = ds.getRepository(Control)
  const mapRepo  = ds.getRepository(ControlMapping)
  const domRepo  = ds.getRepository(GovernanceDomain)
  const orgRepo  = ds.getRepository(Organization)
  const tmplRepo = ds.getRepository(AssessmentTemplate)
  const tmplCtlRepo = ds.getRepository(AssessmentTemplateControl)

  // ── Ensure default org ─────────────────────────────────────────
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
  console.log('\n── Governance Domains')
  for (const d of GOVERNANCE_DOMAIN_SEED) {
    const existing = await domRepo.findOne({ where: { organization_id: orgId, code: d.code } })
    if (!existing) {
      await domRepo.save(domRepo.create({ ...d, organization_id: orgId }))
      console.log(`  ✓ ${d.name}`)
    }
  }

  // ── Frameworks ─────────────────────────────────────────────────
  console.log('\n── Frameworks')
  const fwMap: Record<string, string> = {}
  for (const fw of FRAMEWORK_SEED) {
    let existing = await fwRepo.findOne({ where: { framework_id: fw.framework_id } })
    if (!existing) {
      existing = await fwRepo.save(fwRepo.create({
        ...fw,
        organization_id: orgId,
        is_builtin: true,
        effective_date: fw.effective_date ? new Date(fw.effective_date) as any : null,
      }))
      console.log(`  ✓ ${fw.name}`)
    }
    fwMap[fw.framework_id] = existing.id
  }

  // ── Controls ───────────────────────────────────────────────────
  console.log('\n── Controls')
  const ctlMap: Record<string, string> = {}
  for (const ctl of CONTROL_SEED) {
    let existing = await ctlRepo.findOne({ where: { control_id: ctl.control_id } })
    if (!existing) {
      existing = await ctlRepo.save(ctlRepo.create({
        ...ctl,
        organization_id: orgId,
        is_builtin: true,
      }))
      console.log(`  ✓ ${ctl.control_id} — ${ctl.name}`)
    }
    ctlMap[ctl.control_id] = existing.id
  }

  // ── Control Mappings ───────────────────────────────────────────
  console.log('\n── Control Mappings')
  let mappingCount = 0
  for (const m of CONTROL_MAPPING_SEED) {
    const controlUUID   = ctlMap[m.control_id]
    const frameworkUUID = fwMap[m.framework_id]
    if (!controlUUID || !frameworkUUID) continue

    const existing = await mapRepo.findOne({
      where: { control_id: controlUUID, framework_id: frameworkUUID },
    })
    if (!existing) {
      await mapRepo.save(mapRepo.create({
        ...m,
        control_id:      controlUUID,
        framework_id:    frameworkUUID,
        obligation_id:   frameworkUUID,
        organization_id: orgId,
      }))
      mappingCount++
    }
  }
  console.log(`  ✓ ${mappingCount} mappings created`)

  // ── Assessment Templates ───────────────────────────────────────
  console.log('\n── Assessment Templates')
  for (const tmpl of ASSESSMENT_TEMPLATE_SEED) {
    const fwUUID = fwMap[tmpl.framework_id]
    if (!fwUUID) {
      console.warn(`  ⚠ Skip template "${tmpl.name}" — framework not found`)
      continue
    }

    let existing = await tmplRepo.findOne({ where: { name: tmpl.name, organization_id: orgId } })
    if (!existing) {
      existing = await tmplRepo.save(tmplRepo.create({
        name:                tmpl.name,
        type:                tmpl.type,
        framework_id:        fwUUID,
        related_domain_code: tmpl.related_domain_code,
        scoring_model:       tmpl.scoring_model,
        frequency:           tmpl.frequency,
        description:         tmpl.description,
        organization_id:     orgId,
        status:              'active',
      }))
      console.log(`  ✓ Template: ${tmpl.name}`)

      // Seed template controls
      let order = 0
      for (const ctlCode of tmpl.control_ids) {
        const ctlUUID = ctlMap[ctlCode]
        if (!ctlUUID) {
          console.warn(`    ⚠ Control ${ctlCode} not found`)
          continue
        }
        await tmplCtlRepo.save(tmplCtlRepo.create({
          template_id: existing.id,
          control_id:  ctlUUID,
          sort_order:  order++,
          is_required: true,
        }))
      }
      console.log(`    → ${order} controls linked`)
    }
  }

  await ds.destroy()
  console.log('\n✅ Seed completed successfully!')
}

run().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
