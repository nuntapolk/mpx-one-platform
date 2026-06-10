import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { AccessReview } from '../../database/entities/access-review.entity'

@Injectable()
export class AccessReviewService {
  constructor(@InjectRepository(AccessReview) private repo: Repository<AccessReview>) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('AccessReview ' + id + ' not found')
    return item
  }

  async create(body: any, orgId: string) {
    const data = { ...body, organization_id: orgId, status: 'pending' }
    if (data.decision && data.decision !== 'pending') { data.status = 'completed'; data.reviewed_at = new Date() }
    return this.repo.save(this.repo.create(data))
  }

  async update(id: string, body: any, orgId: string) {
    const cur = await this.findOne(id, orgId)
    const data = { ...body }
    // first time a decision is made → mark completed
    if (data.decision && data.decision !== 'pending' && cur.decision === 'pending') {
      data.status = 'completed'; data.reviewed_at = new Date()
    }
    await this.repo.update({ id, organization_id: orgId }, data)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.delete({ id, organization_id: orgId })
    return { success: true }
  }

  async bulkComplete(ids: string[], decision: string, orgId: string) {
    if (!Array.isArray(ids) || ids.length === 0) return { updated: 0 }
    const res = await this.repo.update(
      { id: In(ids), organization_id: orgId, status: 'pending' },
      { decision, status: 'completed', reviewed_at: new Date() },
    )
    return { updated: res.affected ?? 0 }
  }

  async getStats(orgId: string) {
    const all: any[] = await this.repo.find({ where: { organization_id: orgId } })
    const today = new Date().toISOString().slice(0, 10)
    const pending = all.filter(a => a.status === 'pending')
    const overdue = pending.filter(a => a.due_date && String(a.due_date).slice(0, 10) < today)
    const byDecision: Record<string, number> = {}
    for (const a of all) { const d = a.decision || 'pending'; byDecision[d] = (byDecision[d] ?? 0) + 1 }
    return {
      total: all.length,
      pending: pending.length,
      overdue: overdue.length,
      completed: all.filter(a => a.status === 'completed').length,
      by_decision: byDecision,
    }
  }
}
