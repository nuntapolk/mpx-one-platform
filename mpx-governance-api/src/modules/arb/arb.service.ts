import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ArbRequest } from '../../database/entities/arb-request.entity'

@Injectable()
export class ArbService {
  constructor(@InjectRepository(ArbRequest) private repo: Repository<ArbRequest>) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const r = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!r) throw new NotFoundException('ArbRequest ' + id + ' not found')
    return r
  }

  async create(body: any, orgId: string) {
    const year = new Date().getFullYear()
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const num = body.arb_number || `ARB-${year}-${String(count + 1).padStart(3, '0')}`
    return this.repo.save(this.repo.create({ ...body, arb_number: num, organization_id: orgId, status: body.status || 'submitted' }))
  }

  async update(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async decide(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    const status = body.status || 'approved'
    await this.repo.update({ id, organization_id: orgId }, {
      status, decision: body.decision, conditions: body.conditions, decided_at: new Date(),
    })
    return this.findOne(id, orgId)
  }

  async addFinding(id: string, body: any, orgId: string) {
    const r = await this.findOne(id, orgId)
    const findings = Array.isArray(r.findings) ? [...r.findings] : []
    findings.push({ type: body.type || 'observation', severity: body.severity || 'medium', text: body.text || '' })
    await this.repo.update({ id, organization_id: orgId }, { findings })
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.delete({ id, organization_id: orgId })
    return { success: true }
  }

  async getDashboard(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const tally = (k: (r: ArbRequest) => string) => {
      const o: Record<string, number> = {}; for (const r of all) { const v = k(r); if (v) o[v] = (o[v] || 0) + 1 } return o
    }
    const open = all.filter(r => ['submitted', 'in_review', 'deferred'].includes(r.status))
    return {
      total: all.length,
      open: open.length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      conditional: all.filter(r => r.status === 'conditional').length,
      by_status: tally(r => r.status),
      by_type: tally(r => r.request_type),
      by_risk: tally(r => r.risk_level),
    }
  }
}
