import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Consent } from '../../database/entities/consent.entity'
import { ConsentTemplate } from '../../database/entities/consent-template.entity'
import { DataSubject } from '../../database/entities/data-subject.entity'
import { AccessLogService } from '../access-log/access-log.service'

export function consentStatus(c: Consent): string {
  if (c.withdrawn_at) return 'withdrawn'
  if (c.expires_at && new Date(c.expires_at) < new Date()) return 'expired'
  if (c.granted) return 'granted'
  return 'denied'
}
export function isActive(c: Consent): boolean {
  return c.granted && !c.withdrawn_at && (!c.expires_at || new Date(c.expires_at) > new Date())
}

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)         private repo: Repository<Consent>,
    @InjectRepository(ConsentTemplate) private tmplRepo: Repository<ConsentTemplate>,
    @InjectRepository(DataSubject)     private subjRepo: Repository<DataSubject>,
    private readonly accessLog: AccessLogService,
  ) {}

  // ── Consents ─────────────────────────────────────────────────
  async findAll(orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
    return rows.map(c => ({ ...c, status: consentStatus(c), is_active: isActive(c) }))
  }

  async findBySubject(subjectId: string, orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId, data_subject_id: subjectId }, order: { created_at: 'DESC' } })
    return rows.map(c => ({ ...c, status: consentStatus(c), is_active: isActive(c) }))
  }

  private logConsent(action: string, id: string, orgId: string, subjectId?: string) {
    // P6 — immutable consent event log (PDPA ม.19 proof of consent / withdrawal)
    this.accessLog.record({
      organization_id: orgId, category: 'consent', severity: 'info',
      action, resource_type: 'consent', resource_id: id,
      pii_categories: ['name', 'email'], legal_basis: 'consent',
      endpoint: `consent/${id}`, outcome: 'success',
    }).catch(() => {})
  }

  async create(body: Partial<Consent>, orgId: string) {
    const granted = body.granted ?? false
    const saved: any = await this.repo.save(this.repo.create({
      ...body, organization_id: orgId,
      granted_at: granted ? new Date() : undefined,
    }))
    this.logConsent(granted ? 'consent_grant' : 'consent_deny', saved.id, orgId, saved.data_subject_id)
    return saved
  }

  async withdraw(id: string, reason: string, orgId: string) {
    const c = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!c) throw new NotFoundException(`Consent ${id} not found`)
    await this.repo.update({ id }, { withdrawn_at: new Date(), withdrawal_reason: reason, granted: false })
    this.logConsent('consent_withdraw', id, orgId, c.data_subject_id)
    return this.repo.findOne({ where: { id } })
  }

  // ── Templates ────────────────────────────────────────────────
  findTemplates(orgId: string) {
    return this.tmplRepo.find({ where: { organization_id: orgId }, order: { name: 'ASC' } })
  }
  createTemplate(body: Partial<ConsentTemplate>, orgId: string) {
    return this.tmplRepo.save(this.tmplRepo.create({ ...body, organization_id: orgId }))
  }
  async updateTemplate(id: string, body: Partial<ConsentTemplate>, orgId: string) {
    await this.tmplRepo.update({ id, organization_id: orgId }, body)
    return this.tmplRepo.findOne({ where: { id } })
  }

  // ── Data Subjects ────────────────────────────────────────────
  findSubjects(orgId: string) {
    return this.subjRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }
  async createSubject(body: Partial<DataSubject>, orgId: string) {
    const count = await this.subjRepo.count({ where: { organization_id: orgId } })
    const ref = body.reference_id || `DS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
    return this.subjRepo.save(this.subjRepo.create({ ...body, reference_id: ref, organization_id: orgId }))
  }

  // ── Stats ────────────────────────────────────────────────────
  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    let granted = 0, withdrawn = 0, expired = 0
    for (const c of all) {
      const s = consentStatus(c)
      if (s === 'granted') granted++
      else if (s === 'withdrawn') withdrawn++
      else if (s === 'expired') expired++
    }
    const subjects = await this.subjRepo.count({ where: { organization_id: orgId } })
    const templates = await this.tmplRepo.count({ where: { organization_id: orgId, status: 'active' } })
    return { total: all.length, granted, withdrawn, expired, data_subjects: subjects, active_templates: templates }
  }
}
