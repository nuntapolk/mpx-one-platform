import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AssessmentTemplate } from '../../database/entities/assessment-template.entity'
import { AssessmentTemplateControl } from '../../database/entities/assessment-template-control.entity'
import { Assessment } from '../../database/entities/assessment.entity'
import { AssessmentResponse } from '../../database/entities/assessment-response.entity'

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(AssessmentTemplate) private tmplRepo: Repository<AssessmentTemplate>,
    @InjectRepository(AssessmentTemplateControl) private tmplCtrlRepo: Repository<AssessmentTemplateControl>,
    @InjectRepository(Assessment) private asmRepo: Repository<Assessment>,
    @InjectRepository(AssessmentResponse) private respRepo: Repository<AssessmentResponse>,
  ) {}

  // Templates
  findAllTemplates(orgId: string) { return this.tmplRepo.find({ where: { organization_id: orgId }, order: { name: 'ASC' } }) }
  async findOneTemplate(id: string, orgId: string) {
    const item = await this.tmplRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Template ${id} not found`)
    return item
  }
  createTemplate(body: Partial<AssessmentTemplate>, orgId: string) { return this.tmplRepo.save(this.tmplRepo.create({ ...body, organization_id: orgId })) }
  async updateTemplate(id: string, body: Partial<AssessmentTemplate>, orgId: string) {
    await this.findOneTemplate(id, orgId)
    await this.tmplRepo.update({ id, organization_id: orgId }, body)
    return this.findOneTemplate(id, orgId)
  }

  // Assessments
  findAll(orgId: string) { return this.asmRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }
  async findOne(id: string, orgId: string) {
    const item = await this.asmRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Assessment ${id} not found`)
    return item
  }
  create(body: Partial<Assessment>, orgId: string) { return this.asmRepo.save(this.asmRepo.create({ ...body, organization_id: orgId })) }
  async update(id: string, body: Partial<Assessment>, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  // Responses
  getResponses(assessmentId: string) { return this.respRepo.find({ where: { assessment_id: assessmentId } }) }
  upsertResponse(body: Partial<AssessmentResponse>) { return this.respRepo.save(this.respRepo.create(body)) }

  // Status transitions
  async submit(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'submitted', submitted_at: new Date() })
    return this.findOne(id, orgId)
  }
  async approve(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'approved', approved_at: new Date() })
    return this.findOne(id, orgId)
  }
  async reject(id: string, comment: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'rejected', reviewer_comment: comment })
    return this.findOne(id, orgId)
  }
}
