import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { EaCapability } from '../../database/entities/ea-capability.entity'
import { EaCapabilityMap } from '../../database/entities/ea-capability-map.entity'
import { Application } from '../../database/entities/application.entity'

const DOMAINS = ['business', 'application', 'data', 'technology', 'security']

@Injectable()
export class EaCapabilitiesService {
  constructor(
    @InjectRepository(EaCapability) private caps: Repository<EaCapability>,
    @InjectRepository(EaCapabilityMap) private maps: Repository<EaCapabilityMap>,
    @InjectRepository(Application) private apps: Repository<Application>,
  ) {}

  async findAll(orgId: string, domain?: string) {
    const where: any = { organization_id: orgId }
    if (domain) where.domain = domain
    const caps = await this.caps.find({ where, order: { domain: 'ASC', code: 'ASC' } })
    // attach coverage counts
    const ids = caps.map(c => c.id)
    const allMaps = ids.length ? await this.maps.find({ where: { organization_id: orgId, capability_id: In(ids) } }) : []
    const byCap = new Map<string, EaCapabilityMap[]>()
    for (const m of allMaps) { (byCap.get(m.capability_id) || byCap.set(m.capability_id, []).get(m.capability_id))!.push(m) }
    return caps.map(c => {
      const ms = byCap.get(c.id) || []
      const full = ms.filter(m => m.coverage_level === 'full').length
      return { ...c, app_count: ms.length, full_coverage: full, coverage_status: ms.length === 0 ? 'gap' : full > 0 ? 'covered' : 'partial' }
    })
  }

  async findOne(id: string, orgId: string) {
    const c = await this.caps.findOne({ where: { id, organization_id: orgId } })
    if (!c) throw new NotFoundException('EaCapability ' + id + ' not found')
    const ms = await this.maps.find({ where: { organization_id: orgId, capability_id: id } })
    const appIds = ms.map(m => m.application_id)
    const apps = appIds.length ? await this.apps.find({ where: { id: In(appIds), organization_id: orgId } }) : []
    const appById = new Map(apps.map(a => [a.id, a]))
    return { ...c, coverage: ms.map(m => ({ ...m, application: appById.get(m.application_id) ? { id: m.application_id, name: (appById.get(m.application_id) as any).application_name, code: (appById.get(m.application_id) as any).application_code } : null })) }
  }

  create(body: any, orgId: string) {
    return this.caps.save(this.caps.create({ ...body, organization_id: orgId }))
  }
  async update(id: string, body: any, orgId: string) {
    const c = await this.caps.findOne({ where: { id, organization_id: orgId } })
    if (!c) throw new NotFoundException('not found')
    await this.caps.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }
  async remove(id: string, orgId: string) {
    await this.maps.delete({ capability_id: id, organization_id: orgId })
    await this.caps.delete({ id, organization_id: orgId })
    return { success: true }
  }

  // Coverage mapping
  addCoverage(body: any, orgId: string) {
    return this.maps.save(this.maps.create({
      organization_id: orgId, capability_id: body.capability_id, application_id: body.application_id,
      coverage_level: body.coverage_level || 'partial', role: body.role, notes: body.notes,
    }))
  }
  async removeCoverage(id: string, orgId: string) {
    await this.maps.delete({ id, organization_id: orgId }); return { success: true }
  }

  // Summary + gap analysis per domain
  async getSummary(orgId: string) {
    const caps = await this.caps.find({ where: { organization_id: orgId } })
    const allMaps = await this.maps.find({ where: { organization_id: orgId } })
    const coveredCapIds = new Set(allMaps.map(m => m.capability_id))
    const out: Record<string, any> = {}
    for (const d of DOMAINS) {
      const dcaps = caps.filter(c => c.domain === d)
      const covered = dcaps.filter(c => coveredCapIds.has(c.id)).length
      out[d] = {
        total: dcaps.length, covered, gaps: dcaps.length - covered,
        coverage_pct: dcaps.length ? Math.round(covered / dcaps.length * 100) : 0,
      }
    }
    return { domains: out, total_capabilities: caps.length, total_mappings: allMaps.length }
  }

  async getGaps(orgId: string) {
    const caps = await this.caps.find({ where: { organization_id: orgId } })
    const allMaps = await this.maps.find({ where: { organization_id: orgId } })
    const coveredCapIds = new Set(allMaps.map(m => m.capability_id))
    return caps.filter(c => !coveredCapIds.has(c.id))
      .map(c => ({ id: c.id, domain: c.domain, code: c.code, name: c.name, tier: c.tier, category: c.category }))
  }
}
