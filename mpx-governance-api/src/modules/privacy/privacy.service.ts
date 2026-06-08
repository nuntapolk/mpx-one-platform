import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrivacyNotice } from '../../database/entities/privacy-notice.entity'
import { RetentionSchedule } from '../../database/entities/retention-schedule.entity'

export function noticeStatus(n: PrivacyNotice): string {
  if (!n.published_at) return 'draft'
  if (n.expires_at && new Date(n.expires_at) < new Date()) return 'expired'
  if (n.is_active) return 'published'
  return 'inactive'
}

@Injectable()
export class PrivacyService {
  constructor(
    @InjectRepository(PrivacyNotice)     private noticeRepo: Repository<PrivacyNotice>,
    @InjectRepository(RetentionSchedule) private retRepo: Repository<RetentionSchedule>,
  ) {}

  // ── Privacy Notices ──────────────────────────────────────────
  async findNotices(orgId: string) {
    const rows = await this.noticeRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
    return rows.map(n => ({ ...n, status: noticeStatus(n) }))
  }
  createNotice(body: Partial<PrivacyNotice>, orgId: string) {
    return this.noticeRepo.save(this.noticeRepo.create({ ...body, organization_id: orgId }))
  }
  async updateNotice(id: string, body: Partial<PrivacyNotice>, orgId: string) {
    await this.noticeRepo.update({ id, organization_id: orgId }, body)
    return this.noticeRepo.findOne({ where: { id } })
  }
  async publishNotice(id: string, orgId: string) {
    const n = await this.noticeRepo.findOne({ where: { id, organization_id: orgId } })
    if (!n) throw new NotFoundException(`Notice ${id} not found`)
    await this.noticeRepo.update({ id }, { published_at: new Date(), is_active: true })
    return this.noticeRepo.findOne({ where: { id } })
  }

  // ── Retention Schedules ──────────────────────────────────────
  findRetention(orgId: string) {
    return this.retRepo.find({ where: { organization_id: orgId }, order: { data_category: 'ASC' } })
  }
  createRetention(body: Partial<RetentionSchedule>, orgId: string) {
    return this.retRepo.save(this.retRepo.create({ ...body, organization_id: orgId }))
  }
  async updateRetention(id: string, body: Partial<RetentionSchedule>, orgId: string) {
    await this.retRepo.update({ id, organization_id: orgId }, body)
    return this.retRepo.findOne({ where: { id } })
  }
  async removeRetention(id: string, orgId: string) {
    await this.retRepo.update({ id, organization_id: orgId }, { is_active: false })
    return { success: true }
  }

  // ── Stats ────────────────────────────────────────────────────
  async getStats(orgId: string) {
    const notices = await this.noticeRepo.find({ where: { organization_id: orgId } })
    let published = 0, draft = 0, expired = 0
    for (const n of notices) {
      const s = noticeStatus(n)
      if (s === 'published') published++
      else if (s === 'draft') draft++
      else if (s === 'expired') expired++
    }
    const retentionCount = await this.retRepo.count({ where: { organization_id: orgId, is_active: true } })
    return { notices_total: notices.length, published, draft, expired, retention_schedules: retentionCount }
  }
}
