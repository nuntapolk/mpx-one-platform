import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
import * as fs from 'fs'
import * as path from 'path'
import { RopaActivity } from '../entities/ropa.entity'
import { ExternalParty } from '../entities/external-party.entity'
import { DataProcessingAgreement } from '../entities/dpa.entity'
import { DpoTask } from '../entities/dpo-task.entity'
import { PrivacyNotice } from '../entities/privacy-notice.entity'
import { BreachIncident } from '../entities/breach-incident.entity'
import { RightsRequest } from '../entities/rights-request.entity'
import { ConsentTemplate } from '../entities/consent-template.entity'
import { DataSubject } from '../entities/data-subject.entity'
import { TrainingCourse } from '../entities/training-course.entity'
import { TrainingCompletion } from '../entities/training-completion.entity'
import { Dpia } from '../entities/dpia.entity'
import { Organization } from '../entities/organization.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  entities: [RopaActivity, ExternalParty, DataProcessingAgreement, DpoTask, PrivacyNotice, BreachIncident, RightsRequest, ConsentTemplate, DataSubject, TrainingCourse, TrainingCompletion, Dpia, Organization],
})

// Normalize partial dates ('2024-06' → '2024-06-01'); blank → null
const DATE_RE = /_(at|date)$|^(start_date|end_date)$/
function clean(obj: any) {
  const o: any = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue
    if (v === '' ) { o[k] = null; continue }
    if (v != null && DATE_RE.test(k) && typeof v === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) o[k] = v          // ISO date/datetime
      else if (/^\d{4}-\d{2}$/.test(v)) o[k] = v + '-01'
      else if (/^\d{4}$/.test(v)) o[k] = v + '-01-01'
      else o[k] = null                                    // free-text date (เช่น "1 มกราคม 2568") → null
    } else o[k] = v
  }
  return o
}

async function run() {
  await ds.initialize()
  const org = await ds.getRepository(Organization).findOne({ where: { slug: 'default' } })
  if (!org) { console.error('no org'); process.exit(1) }
  const o = org.id
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pdpa-studio-migration.json'), 'utf8'))

  const ropaMap = new Map<string, string>()   // old ropa id → new id
  const partyMap = new Map<string, string>()
  const courseMap = new Map<string, string>()
  const stats: Record<string, number> = {}

  async function importList(name: string, repo: any, items: any[], natKey: string | null, prep: (x: any) => any, after?: (orig: any, saved: any) => void) {
    let n = 0
    for (const it of items) {
      try {
        const body = prep(clean(it))
        if (natKey && body[natKey]) {
          const exists = await repo.findOne({ where: { organization_id: o, [natKey]: body[natKey] } })
          if (exists) { if (after) after(it, exists); continue }
        }
        const saved = await repo.save(repo.create({ ...body, organization_id: o }))
        if (after) after(it, saved)
        n++
      } catch (e: any) { /* skip bad row */ }
    }
    stats[name] = n
  }

  const R = ds.getRepository.bind(ds)

  // ROPA
  await importList('ropa', R(RopaActivity), data.ropa, 'ropa_code',
    (x) => ({ ...x, ropa_code: 'PS-' + (x.ropa_code || Math.random().toString(36).slice(2, 8)) }),
    (orig, saved) => ropaMap.set(orig._old_id, saved.id))

  // External parties
  await importList('parties', R(ExternalParty), data.parties, 'code',
    (x) => ({ ...x, code: 'PS-' + (x.code || Math.random().toString(36).slice(2, 8)) }),
    (orig, saved) => partyMap.set(orig._old_id, saved.id))

  // DPA (link party)
  await importList('dpas', R(DataProcessingAgreement), data.dpas, 'dpa_number',
    (x) => ({ ...x, dpa_number: 'PS-' + (x.dpa_number || Math.random().toString(36).slice(2, 8)) }),
    undefined)
  // re-link party manually since prep can't see map order — patch below
  for (const d of data.dpas) {
    const pid = partyMap.get(d._old_party_id)
    if (pid && d.dpa_number) {
      await R(DataProcessingAgreement).update({ organization_id: o, dpa_number: 'PS-' + d.dpa_number }, { external_party_id: pid }).catch(() => {})
    }
  }

  await importList('dpo_tasks', R(DpoTask), data.dpo_tasks, 'title', (x) => x)
  await importList('privacy_notices', R(PrivacyNotice), data.privacy_notices, 'title', (x) => x)
  await importList('breaches', R(BreachIncident), data.breaches, 'incident_number', (x) => ({ ...x, incident_number: 'PS-' + (x.incident_number || Math.random().toString(36).slice(2, 8)) }))
  await importList('dsar', R(RightsRequest), data.dsar, 'ticket_number', (x) => ({ ...x, ticket_number: 'PS-' + (x.ticket_number || Math.random().toString(36).slice(2, 8)) }))
  await importList('consent_templates', R(ConsentTemplate), data.consent_templates, 'slug', (x) => ({ ...x, slug: 'ps-' + (x.slug || Math.random().toString(36).slice(2, 8)) }))
  await importList('data_subjects', R(DataSubject), data.data_subjects, 'reference_id', (x) => ({ ...x, reference_id: 'PS-' + (x.reference_id || Math.random().toString(36).slice(2, 8)) }))

  // Training courses → map old→new (dedup by title; map covers existing too)
  await importList('training_courses', R(TrainingCourse), data.training_courses, 'title', (x) => x,
    (orig, saved) => courseMap.set(orig._old_id, saved.id))
  // completions (link course; user_id omitted — studio uses int ids, column is uuid)
  let tc = 0
  for (const it of data.training_completions) {
    const cid = courseMap.get(it._old_course_id)
    if (!cid) continue
    const { user_id, ...rest } = clean(it)
    try { await R(TrainingCompletion).save(R(TrainingCompletion).create({ ...rest, course_id: cid, organization_id: o } as any)); tc++ } catch {}
  }
  stats['training_completions'] = tc

  // DPIA (link ropa)
  await importList('dpias', R(Dpia), data.dpias, 'dpia_number',
    (x) => ({ ...x, dpia_number: 'PS-' + (x.dpia_number || Math.random().toString(36).slice(2, 8)) }), undefined)
  for (const d of data.dpias) {
    const rid = ropaMap.get(d._old_ropa_id)
    if (rid && d.dpia_number) await R(Dpia).update({ organization_id: o, dpia_number: 'PS-' + d.dpia_number }, { ropa_record_id: rid }).catch(() => {})
  }

  console.log('  Migration results:')
  for (const [k, v] of Object.entries(stats)) console.log(`    ${k}: ${v}`)
  await ds.destroy()
  console.log('✅ PDPA Studio migration completed!')
}
run().catch(e => { console.error(e); process.exit(1) })
