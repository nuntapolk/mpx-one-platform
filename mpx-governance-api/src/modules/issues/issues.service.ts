import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)       private issueRepo: Repository<Issue>,
    @InjectRepository(ActionPlan)  private actionRepo: Repository<ActionPlan>,
  ) {}

  findAll(orgId: string) {
    return this.issueRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.issueRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Issue ${id} not found`)
    return item
  }

  async create(body: Partial<Issue>, orgId: string) {
    const count = await this.issueRepo.count({ where: { organization_id: orgId } })
    const year  = new Date().getFullYear()
    const issue_id = `ISS-${year}-${String(count + 1).padStart(3, '0')}`
    return this.issueRepo.save(this.issueRepo.create({
      ...body, issue_id, organization_id: orgId, status: body.status || 'open',
    }))
  }

  async update(id: string, body: Partial<Issue>, orgId: string) {
    await this.findOne(id, orgId)
    await this.issueRepo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async close(id: string, reviewerId: string, comment: string, orgId: string) {
    await this.findOne(id, orgId)
    const now: any = new Date()
    await this.issueRepo.update({ id }, { status: 'closed', reviewer_id: reviewerId, reviewer_comment: comment, closure_date: now })
    return this.findOne(id, orgId)
  }

  getActionPlans(orgId: string) {
    return this.actionRepo.find({ where: { organization_id: orgId }, order: { due_date: 'ASC' } })
  }

  getActionPlansByIssue(issueId: string) {
    return this.actionRepo.find({ where: { issue_id: issueId }, order: { due_date: 'ASC' } })
  }

  async createActionPlan(issueId: string, body: Partial<ActionPlan>, orgId: string) {
    const count = await this.actionRepo.count({ where: { organization_id: orgId } })
    const year  = new Date().getFullYear()
    const action_id = `ACT-${year}-${String(count + 1).padStart(3, '0')}`
    return this.actionRepo.save(this.actionRepo.create({
      ...body, action_id, issue_id: issueId, organization_id: orgId, status: 'open',
    }))
  }

  async updateActionPlan(id: string, body: Partial<ActionPlan>, orgId: string) {
    await this.actionRepo.update({ id, organization_id: orgId }, body)
    return this.actionRepo.findOne({ where: { id } })
  }

  async completeActionPlan(id: string, note: string, orgId: string) {
    const now: any = new Date()
    await this.actionRepo.update({ id, organization_id: orgId }, { status: 'completed', completion_date: now, completion_note: note })
    return this.actionRepo.findOne({ where: { id } })
  }

  async getStats(orgId: string) {
    const [total, open, inProgress, pendingReview, closed] = await Promise.all([
      this.issueRepo.count({ where: { organization_id: orgId } }),
      this.issueRepo.count({ where: { organization_id: orgId, status: 'open' } }),
      this.issueRepo.count({ where: { organization_id: orgId, status: 'in_progress' } }),
      this.issueRepo.count({ where: { organization_id: orgId, status: 'pending_review' } }),
      this.issueRepo.count({ where: { organization_id: orgId, status: 'closed' } }),
    ])
    const critical = await this.issueRepo.createQueryBuilder('i')
      .where('i.organization_id = :orgId', { orgId })
      .andWhere("i.severity IN ('critical','high')")
      .andWhere("i.status NOT IN ('closed','resolved')")
      .getCount()
    const overdueActions = await this.actionRepo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
      .andWhere('a.due_date < NOW()')
      .andWhere("a.status NOT IN ('completed','cancelled')")
      .getCount()
    return { total, open, in_progress: inProgress, pending_review: pendingReview, closed, critical_open: critical, overdue_actions: overdueActions }
  }

  async getOverdueActions(orgId: string) {
    return this.actionRepo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
      .andWhere('a.due_date < NOW()')
      .andWhere("a.status NOT IN ('completed','cancelled')")
      .orderBy('a.due_date', 'ASC')
      .getMany()
  }
}
