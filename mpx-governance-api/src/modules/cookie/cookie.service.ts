import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CookieBannerSetting } from '../../database/entities/cookie-banner.entity'
import { CookieConsent } from '../../database/entities/cookie-consent.entity'

@Injectable()
export class CookieService {
  constructor(
    @InjectRepository(CookieBannerSetting) private bannerRepo: Repository<CookieBannerSetting>,
    @InjectRepository(CookieConsent)       private consentRepo: Repository<CookieConsent>,
  ) {}

  // ── Banner settings ──────────────────────────────────────────
  findBanners(orgId: string) { return this.bannerRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }
  createBanner(body: Partial<CookieBannerSetting>, orgId: string) {
    return this.bannerRepo.save(this.bannerRepo.create({ ...body, organization_id: orgId }))
  }
  async updateBanner(id: string, body: Partial<CookieBannerSetting>, orgId: string) {
    await this.bannerRepo.update({ id, organization_id: orgId }, body as any)
    return this.bannerRepo.findOne({ where: { id } })
  }

  // ── Consents (log) ───────────────────────────────────────────
  findConsents(orgId: string) { return this.consentRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' }, take: 200 }) }
  recordConsent(body: Partial<CookieConsent>, orgId: string) {
    return this.consentRepo.save(this.consentRepo.create({ ...body, organization_id: orgId, consented_at: new Date() }))
  }

  async getStats(orgId: string) {
    const consents = await this.consentRepo.find({ where: { organization_id: orgId } })
    let acceptAll = 0, rejectAll = 0, custom = 0
    for (const c of consents) {
      if (c.action === 'accept_all') acceptAll++
      else if (c.action === 'reject_all') rejectAll++
      else custom++
    }
    const banners = await this.bannerRepo.count({ where: { organization_id: orgId, is_active: true } })
    const total = consents.length
    const acceptRate = total > 0 ? Math.round((acceptAll / total) * 100) : 0
    return { total_consents: total, accept_all: acceptAll, reject_all: rejectAll, custom, accept_rate: acceptRate, active_banners: banners }
  }
}
