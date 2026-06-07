import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OicRequirement } from '../../database/entities/oic-requirement.entity'
import { Evidence } from '../../database/entities/evidence.entity'

@Injectable()
export class OicService {
  constructor(
    @InjectRepository(OicRequirement) private repo: Repository<OicRequirement>,
    @InjectRepository(Evidence)       private evdRepo: Repository<Evidence>,
  ) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { requirement_code: 'ASC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`OIC requirement ${id} not found`)
    return item
  }

  create(body: Partial<OicRequirement>, orgId: string) {
    return this.repo.save(this.repo.create({ ...body, organization_id: orgId }))
  }

  async update(id: string, body: Partial<OicRequirement>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async linkEvidence(id: string, evidenceId: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { linked_evidence_id: evidenceId })
    return this.findOne(id, orgId)
  }

  // ── Readiness calculation ────────────────────────────────────
  async getReadiness(orgId: string) {
    const reqs = await this.repo.find({ where: { organization_id: orgId, status: 'active' } })

    // requirement is "ready" if it has both a mapped control AND an accepted evidence
    const acceptedEvidenceIds = new Set(
      (await this.evdRepo.find({ where: { organization_id: orgId, status: 'accepted' } })).map(e => e.id),
    )

    const byArea: Record<string, { total: number; ready: number; missing_evidence: number; high_risk_gap: number }> = {}

    let totalReady = 0
    for (const r of reqs) {
      const a = (byArea[r.oic_area] ??= { total: 0, ready: 0, missing_evidence: 0, high_risk_gap: 0 })
      a.total++
      const hasControl = !!r.mapped_control_id
      const hasEvidence = !!r.linked_evidence_id && acceptedEvidenceIds.has(r.linked_evidence_id)
      const ready = hasControl && hasEvidence
      if (ready) { a.ready++; totalReady++ }
      if (!hasEvidence) a.missing_evidence++
      if (!ready && ['critical', 'high'].includes(r.criticality)) a.high_risk_gap++
    }

    const areas = Object.entries(byArea).map(([area, s]) => ({
      area,
      total: s.total,
      ready: s.ready,
      readiness_pct: s.total > 0 ? Math.round((s.ready / s.total) * 100) : 0,
      missing_evidence: s.missing_evidence,
      high_risk_gap: s.high_risk_gap,
    })).sort((a, b) => a.area.localeCompare(b.area))

    return {
      overall_readiness: reqs.length > 0 ? Math.round((totalReady / reqs.length) * 100) : 0,
      total_requirements: reqs.length,
      ready: totalReady,
      missing_evidence: reqs.length - reqs.filter(r => r.linked_evidence_id && acceptedEvidenceIds.has(r.linked_evidence_id)).length,
      high_risk_gaps: reqs.filter(r => ['critical', 'high'].includes(r.criticality) && !(r.mapped_control_id && r.linked_evidence_id && acceptedEvidenceIds.has(r.linked_evidence_id))).length,
      areas,
    }
  }

  async getMissingEvidence(orgId: string) {
    const reqs = await this.repo.find({ where: { organization_id: orgId, status: 'active' } })
    const acceptedEvidenceIds = new Set(
      (await this.evdRepo.find({ where: { organization_id: orgId, status: 'accepted' } })).map(e => e.id),
    )
    return reqs
      .filter(r => !r.linked_evidence_id || !acceptedEvidenceIds.has(r.linked_evidence_id))
      .map(r => ({ id: r.id, requirement_code: r.requirement_code, oic_area: r.oic_area, requirement_title: r.requirement_title, criticality: r.criticality }))
  }
}
