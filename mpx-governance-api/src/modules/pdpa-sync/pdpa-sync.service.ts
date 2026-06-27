import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { Consent } from '../../database/entities/consent.entity'
import { PdpaStudioClient } from './pdpa-studio.client'

const SOURCE = 'pdpa_studio'
const pick = (o: any, ...keys: string[]) => { for (const k of keys) if (o?.[k] != null && o[k] !== '') return o[k]; return undefined }

export interface DomainResult { domain: string; pulled: number; upserted: number; skipped: number; error?: string }

@Injectable()
export class PdpaSyncService {
  private readonly logger = new Logger(PdpaSyncService.name)
  private lastRun: { at: Date | null; results: DomainResult[] } = { at: null, results: [] }

  constructor(
    private readonly client: PdpaStudioClient,
    @InjectRepository(RopaActivity) private ropaRepo: Repository<RopaActivity>,
    @InjectRepository(RightsRequest) private dsarRepo: Repository<RightsRequest>,
    @InjectRepository(Consent) private consentRepo: Repository<Consent>,
  ) {}

  status() {
    return {
      enabled: this.client.enabled,
      base_url: this.client.baseUrl,
      direction: 'pull_only',
      last_run_at: this.lastRun.at,
      domains: this.lastRun.results,
    }
  }

  // Generic upsert: never overwrites MPX-origin records; matches on (org, external_id, source).
  private async upsert<T extends { id?: string }>(
    repo: Repository<any>, org: string, externalId: string, map: () => Partial<T>,
  ): Promise<'created' | 'updated' | 'skipped'> {
    if (!externalId) return 'skipped'
    const existing = await repo.findOne({ where: { organization_id: org, external_id: String(externalId), external_source: SOURCE } as any })
    if (existing && existing.origin && existing.origin !== SOURCE) return 'skipped' // protect local edits
    const base = { ...map(), organization_id: org, external_id: String(externalId), external_source: SOURCE, origin: SOURCE, last_synced_at: new Date() }
    try {
      if (existing) { await repo.update({ id: existing.id }, base as any); return 'updated' }
      await repo.save(repo.create(base as any)); return 'created'
    } catch (e: any) { this.logger.warn(`upsert ${repo.metadata.tableName} ${externalId} failed: ${e.message}`); return 'skipped' }
  }

  private async syncRopa(org: string): Promise<DomainResult> {
    const r: DomainResult = { domain: 'ropa', pulled: 0, upserted: 0, skipped: 0 }
    try {
      const items = await this.client.ropa(); r.pulled = items.length
      for (const it of items) {
        const ext = String(pick(it, 'id', 'ropa_code', 'code') ?? '')
        const res = await this.upsert<RopaActivity>(this.ropaRepo, org, ext, () => ({
          ropa_code: pick(it, 'ropa_code', 'code') || `PS-ROPA-${ext}`,
          processing_activity_name: pick(it, 'processing_activity_name', 'name', 'title') || `(PDPA Studio ${ext})`,
          description: pick(it, 'description', 'purpose'),
          external_payload: it,
        }))
        res === 'skipped' ? r.skipped++ : r.upserted++
      }
    } catch (e: any) { r.error = e.message }
    return r
  }

  private async syncDsar(org: string): Promise<DomainResult> {
    const r: DomainResult = { domain: 'dsar', pulled: 0, upserted: 0, skipped: 0 }
    try {
      const items = await this.client.rightsRequests(); r.pulled = items.length
      for (const it of items) {
        const ext = String(pick(it, 'id', 'ticket', 'ticket_number') ?? '')
        const res = await this.upsert<RightsRequest>(this.dsarRepo, org, ext, () => ({
          ticket_number: pick(it, 'ticket', 'ticket_number') || `PS-DSAR-${ext}`,
          type: pick(it, 'type', 'request_type') || 'access',
          status: pick(it, 'status') || 'pending',
          requester_name: pick(it, 'requester_name', 'name'),
          requester_email: pick(it, 'requester_email', 'email'),
          description: pick(it, 'description', 'detail'),
          external_payload: it,
        }))
        res === 'skipped' ? r.skipped++ : r.upserted++
      }
    } catch (e: any) { r.error = e.message }
    return r
  }

  // Consent has no list endpoint -> iterate subjects (capped) and pull per email.
  private async syncConsents(org: string): Promise<DomainResult> {
    const r: DomainResult = { domain: 'consent', pulled: 0, upserted: 0, skipped: 0 }
    try {
      const subjects = (await this.client.subjects()).slice(0, 300)
      for (const s of subjects) {
        const email = pick(s, 'email', 'subject_email')
        if (!email) continue
        let items: any[] = []
        try { items = await this.client.consentsBySubject(email) } catch { continue }
        r.pulled += items.length
        for (const it of items) {
          const ext = String(pick(it, 'id') ?? '')
          const res = await this.upsert<Consent>(this.consentRepo, org, ext, () => ({
            channel: pick(it, 'channel', 'source') || 'web',
            granted: !!pick(it, 'granted', 'consent_given'),
            granted_at: pick(it, 'granted_at') ? new Date(pick(it, 'granted_at')) : undefined,
            withdrawn_at: pick(it, 'withdrawn_at') ? new Date(pick(it, 'withdrawn_at')) : undefined,
            external_payload: it,
          }))
          res === 'skipped' ? r.skipped++ : r.upserted++
        }
      }
    } catch (e: any) { r.error = e.message }
    return r
  }

  async run(org: string, domains?: string[]): Promise<{ enabled: boolean; results: DomainResult[] }> {
    if (!this.client.enabled) return { enabled: false, results: [] }
    const want = (d: string) => !domains?.length || domains.includes(d)
    const results: DomainResult[] = []
    if (want('ropa')) results.push(await this.syncRopa(org))
    if (want('dsar')) results.push(await this.syncDsar(org))
    if (want('consent')) results.push(await this.syncConsents(org))
    this.lastRun = { at: new Date(), results }
    return { enabled: true, results }
  }
}
