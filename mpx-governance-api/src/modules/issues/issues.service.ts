import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue) private issueRepo: Repository<Issue>,
    @InjectRepository(ActionPlan) private actionRepo: Repository<ActionPlan>,
  ) {}

  findAll(orgId: string) { return this.issueRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.issueRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Issue ${id} not found`)
    return item
  }

  create(body: Partial<Issue>, orgId: string) { return this.issueRepo.save(this.issueRepo.create({ ...body, organization_id: orgId })) }

  async update(id: string, body: Partial<Issue>, orgId: string) {
    await this.findOne(id, orgId)
    await this.issueRepo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  // Action Plans
  getActionPlans(orgId: string) { return this.actionRepo.find({ where: { organization_id: orgId }, order: { due_date: 'ASC' } }) }
  getActionPlansByIssue(issueId: string, orgId: string) { return this.actionRepo.find({ where: { issue_id: issueId, organization_id: orgId } }) }
  createActionPlan(body: Partial<ActionPlan>, orgId: string) { return this.actionRepo.save(this.actionRepo.create({ ...body, organization_id: orgId })) }

  async updateActionPlan(id: string, body: Partial<ActionPlan>, orgId: string) {
    await this.actionRepo.update({ id, organization_id: orgId }, body)
    return this.actionRepo.findOne({ where: { id } })
  }
}
