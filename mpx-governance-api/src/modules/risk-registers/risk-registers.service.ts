import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'

@Injectable()
export class RiskRegistersService {
  constructor(
    @InjectRepository(RiskRegister) private repo: Repository<RiskRegister>,
    @InjectRepository(ActionPlan)   private actionRepo: Repository<ActionPlan>,
  ) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Risk ${id} not found`)
    return item
  }

  async create(body: Partial<RiskRegister>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year  = new Date().getFullYear()
    const risk_id = `RSK-${year}-${String(count + 1).padStart(3, '0')}`
    return this.repo.save(this.repo.create({ ...body, risk_id, organization_id: orgId, status: body.status ?? 'open' }))
  }

  async update(id: string, body: Partial<RiskRegister>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { status: 'closed' })
    return { success: true }
  }

  // ── Action Plans ─────────────────────────────────────────────
  getActionPlans(riskId: string) {
    return this.actionRepo.find({ where: { risk_id: riskId }, order: { due_date: 'ASC' } })
  }

  async createActionPlan(riskId: string, body: Partial<ActionPlan>, orgId: string) {
    const count = await this.actionRepo.count({ where: { organization_id: orgId } })
    const year  = new Date().getFullYear()
    const action_id = `ACT-${year}-${String(count + 1).padStart(3, '0')}`
    return this.actionRepo.save(this.actionRepo.create({
      ...body, action_id, risk_id: riskId, organization_id: orgId, status: 'open',
    }))
  }

  // ── Stats & Heatmap ──────────────────────────────────────────
  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })

    const byLevel = { critical: 0, high: 0, medium: 0, low: 0 }
    const byStatus = { open: 0, in_progress: 0, resolved: 0, accepted: 0, closed: 0 }
    const byCategory: Record<string, number> = {}

    for (const r of all) {
      const score = r.likelihood * r.impact
      if (score >= 20)      byLevel.critical++
      else if (score >= 12) byLevel.high++
      else if (score >= 6)  byLevel.medium++
      else                  byLevel.low++

      byStatus[r.status as keyof typeof byStatus] = (byStatus[r.status as keyof typeof byStatus] ?? 0) + 1
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1
    }

    const overdue = await this.actionRepo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
      .andWhere('a.due_date < NOW()')
      .andWhere("a.status NOT IN ('completed','cancelled')")
      .getCount()

    return {
      total: all.length,
      open:  byStatus.open + byStatus.in_progress,
      by_level: byLevel,
      by_status: byStatus,
      by_category: byCategory,
      overdue_actions: overdue,
    }
  }

  async getHeatmapData(orgId: string) {
    const risks = await this.repo.find({ where: { organization_id: orgId, status: 'open' } })
    // Build 5×5 matrix [impact][likelihood] → list of risks
    const matrix: Record<string, { id: string; title: string; risk_id: string; category: string }[]> = {}
    for (let i = 1; i <= 5; i++) {
      for (let l = 1; l <= 5; l++) {
        matrix[`${l}-${i}`] = []
      }
    }
    for (const r of risks) {
      const key = `${r.likelihood}-${r.impact}`
      if (matrix[key]) {
        matrix[key].push({ id: r.id, title: r.title, risk_id: r.risk_id, category: r.category })
      }
    }
    return { matrix, total: risks.length }
  }
}
