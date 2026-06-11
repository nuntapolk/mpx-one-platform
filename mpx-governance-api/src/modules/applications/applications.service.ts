import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Application } from '../../database/entities/application.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Vendor } from '../../database/entities/vendor.entity'

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private repo: Repository<Application>,
    @InjectRepository(RopaActivity) private ropa: Repository<RopaActivity>,
    @InjectRepository(Vendor) private vendors: Repository<Vendor>,
  ) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('Application ' + id + ' not found')
    return item
  }

  async create(body: Partial<Application>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const code = body.application_code || 'APP-' + year + '-' + String(count + 1).padStart(3, '0')
    return this.repo.save(this.repo.create({ ...body, application_code: code, organization_id: orgId }))
  }

  async update(id: string, body: Partial<Application>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { status: 'inactive' })
    return { success: true }
  }

  async getStats(orgId: string) {
    const all: any[] = await this.repo.find({ where: { organization_id: orgId } })
    const active = all.filter(a => !a.decommissioned && a.status !== 'inactive')
    const num = (xs: any[], f: (a: any) => number | null | undefined) => {
      const vals = xs.map(f).filter(v => v != null) as number[]
      return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null
    }
    const tally = (key: (a: any) => string | null | undefined): Record<string, number> => {
      const o: Record<string, number> = {}
      for (const a of active) { const k = key(a); if (k) o[k] = (o[k] || 0) + 1 }
      return o
    }
    const soon = Date.now() + 365 * 864e5
    const eolSoon = active.filter(a => a.eol_date && new Date(a.eol_date).getTime() < soon).length
    return {
      total: all.length,
      active: active.length,
      no_owner: all.filter(a => !a.business_owner_id && !a.system_owner_id && !a.technical_owner_id).length,
      mission_critical: active.filter(a => a.business_criticality === 'critical').length,
      avg_health: num(active, a => a.health_score),
      avg_tech_debt: num(active, a => a.tech_debt_score),
      total_tco: active.reduce((s, a) => s + (Number(a.tco_annual) || 0), 0),
      eol_within_12m: eolSoon,
      by_bcg: tally(a => a.bcg_classification),
      by_lifecycle: tally(a => a.lifecycle_status),
      pii_apps: active.filter(a => a.personal_data_flag).length,
      ai_apps: active.filter(a => a.ai_enabled_flag).length,
    }
  }

  // ⭐ Application 360° — รวมทุก governance lens ของ 1 app
  async get360(id: string, orgId: string) {
    const app = await this.findOne(id, orgId)

    // PDPA: linked ROPA records (carry dpia/risk/cross-border)
    const ropas = await this.ropa.find({ where: { organization_id: orgId, related_application_id: id } })
    const ropaSummary = {
      count: ropas.length,
      dpia_required: ropas.filter(r => (r as any).dpia_required).length,
      cross_border: ropas.filter(r => (r as any).cross_border_transfer_flag).length,
      high_risk: ropas.filter(r => ['high', 'critical'].includes((r as any).risk_level)).length,
      items: ropas.slice(0, 10).map(r => ({ id: r.id, code: r.ropa_code, name: (r as any).processing_activity_name, risk: (r as any).risk_level, dpia_required: (r as any).dpia_required })),
    }

    // Vendor
    let vendor: any = null
    if (app.vendor_id) {
      const v = await this.vendors.findOne({ where: { id: app.vendor_id, organization_id: orgId } })
      if (v) vendor = { id: v.id, name: (v as any).vendor_name, code: (v as any).vendor_code }
    }

    // Compliance lens (from flags)
    const compliance = {
      pdpa: app.personal_data_flag, sensitive: app.sensitive_data_flag,
      iso: app.iso_scope_flag, oic: app.oic_scope_flag,
      ai: app.ai_enabled_flag, internet_facing: app.internet_facing_flag,
    }

    // Lifecycle alerts
    const now = Date.now()
    const alerts: string[] = []
    if (app.eol_date && new Date(app.eol_date).getTime() < now + 365 * 864e5) alerts.push('EOL ภายใน 12 เดือน')
    if (app.contract_end_date && new Date(app.contract_end_date).getTime() < now + 90 * 864e5) alerts.push('สัญญาใกล้หมดอายุ (90 วัน)')
    if (app.personal_data_flag && ropaSummary.count === 0) alerts.push('มีข้อมูลส่วนบุคคลแต่ยังไม่มี ROPA')
    if ((app.tech_debt_score ?? 0) >= 70) alerts.push('Tech debt สูง')

    return {
      application: app,
      apm: {
        bcg: app.bcg_classification, health: app.health_score, tech_debt: app.tech_debt_score,
        tco: app.tco_annual, strategic: app.strategic_value, criticality: app.business_criticality,
      },
      compliance,
      pdpa: ropaSummary,
      vendor,
      alerts,
    }
  }
}
