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
    @InjectRepository(AssessmentTemplate)        private tmplRepo: Repository<AssessmentTemplate>,
    @InjectRepository(AssessmentTemplateControl) private tmplCtrlRepo: Repository<AssessmentTemplateControl>,
    @InjectRepository(Assessment)                private asmRepo: Repository<Assessment>,
    @InjectRepository(AssessmentResponse)        private respRepo: Repository<AssessmentResponse>,
  ) {}

  // ── Templates ────────────────────────────────────────────────
  findAllTemplates(orgId: string) {
    return this.tmplRepo.find({ where: { organization_id: orgId }, order: { name: 'ASC' } })
  }

  async findOneTemplate(id: string, orgId: string) {
    const item = await this.tmplRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Template ${id} not found`)
    return item
  }

  async findTemplateWithControls(id: string, orgId: string) {
    const template = await this.findOneTemplate(id, orgId)
    const items = await this.tmplCtrlRepo
      .createQueryBuilder('tc')
      .where('tc.template_id = :id', { id })
      .orderBy('tc.sort_order', 'ASC')
      .getMany()
    return { ...template, template_controls: items }
  }

  createTemplate(body: Partial<AssessmentTemplate>, orgId: string) {
    return this.tmplRepo.save(this.tmplRepo.create({ ...body, organization_id: orgId }))
  }

  async updateTemplate(id: string, body: Partial<AssessmentTemplate>, orgId: string) {
    await this.findOneTemplate(id, orgId)
    await this.tmplRepo.update({ id, organization_id: orgId }, body)
    return this.findOneTemplate(id, orgId)
  }

  async addControlToTemplate(templateId: string, controlId: string, orgId: string) {
    await this.findOneTemplate(templateId, orgId)
    const count = await this.tmplCtrlRepo.count({ where: { template_id: templateId } })
    return this.tmplCtrlRepo.save(this.tmplCtrlRepo.create({
      template_id: templateId, control_id: controlId, sort_order: count, is_required: true,
    }))
  }

  async removeControlFromTemplate(templateId: string, controlId: string) {
    await this.tmplCtrlRepo.delete({ template_id: templateId, control_id: controlId })
    return { success: true }
  }

  // ── Assessments ──────────────────────────────────────────────
  findAll(orgId: string) {
    return this.asmRepo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.asmRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Assessment ${id} not found`)
    return item
  }

  async findOneWithProgress(id: string, orgId: string) {
    const assessment = await this.findOne(id, orgId)
    const responses  = await this.respRepo.find({ where: { assessment_id: id } })
    const template   = await this.findOneTemplate(assessment.template_id, orgId)
    const controls   = await this.tmplCtrlRepo.find({ where: { template_id: assessment.template_id } })

    const totalControls    = controls.length
    const answeredControls = responses.length
    const passCount    = responses.filter(r => r.pass_fail === 'pass').length
    const failCount    = responses.filter(r => r.pass_fail === 'fail').length
    const findingCount = responses.filter(r => r.has_finding).length

    let computed_score: number | null = null
    if (template.scoring_model === 'pass_fail' && answeredControls > 0) {
      computed_score = Math.round((passCount / answeredControls) * 100)
    } else if (template.scoring_model === 'maturity_0_5' && answeredControls > 0) {
      const total = responses.reduce((s, r) => s + (r.maturity_score ?? 0), 0)
      computed_score = Math.round((total / answeredControls) * 10) / 10
    }

    return {
      ...assessment, template,
      progress: { total: totalControls, answered: answeredControls, pass: passCount, fail: failCount, findings: findingCount, score: computed_score },
    }
  }

  async create(body: Partial<Assessment>, orgId: string) {
    const count = await this.asmRepo.count({ where: { organization_id: orgId } })
    const year  = new Date().getFullYear()
    const assessment_number = `ASM-${year}-${String(count + 1).padStart(3, '0')}`
    return this.asmRepo.save(this.asmRepo.create({ ...body, assessment_number, organization_id: orgId, status: 'draft' }))
  }

  async update(id: string, body: Partial<Assessment>, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  // ── Responses ────────────────────────────────────────────────
  getResponses(assessmentId: string) {
    return this.respRepo.find({ where: { assessment_id: assessmentId } })
  }

  async upsertResponse(assessmentId: string, body: Partial<AssessmentResponse>) {
    const existing = body.control_id
      ? await this.respRepo.findOne({ where: { assessment_id: assessmentId, control_id: body.control_id } })
      : null
    if (existing) {
      await this.respRepo.update({ id: existing.id }, { ...body, assessment_id: assessmentId })
      return this.respRepo.findOne({ where: { id: existing.id } })
    }
    return this.respRepo.save(this.respRepo.create({ ...body, assessment_id: assessmentId }))
  }

  // ── Workflow ─────────────────────────────────────────────────
  async assign(id: string, owner_id: string, due_date: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'assigned', assigned_owner_id: owner_id, due_date: new Date(due_date) as any })
    return this.findOne(id, orgId)
  }

  async start(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'in_progress' })
    return this.findOne(id, orgId)
  }

  async submit(id: string, orgId: string) {
    const asm = await this.findOneWithProgress(id, orgId)
    await this.asmRepo.update({ id }, { status: 'submitted', submitted_at: new Date(), score: asm.progress.score ?? undefined })
    return this.findOne(id, orgId)
  }

  async approve(id: string, reviewer_id: string, comment: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'approved', reviewer_id, reviewer_comment: comment, approved_at: new Date() })
    return this.findOne(id, orgId)
  }

  async reject(id: string, reviewer_id: string, comment: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'rejected', reviewer_id, reviewer_comment: comment })
    return this.findOne(id, orgId)
  }

  async close(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.asmRepo.update({ id }, { status: 'closed', closed_at: new Date() })
    return this.findOne(id, orgId)
  }

  // ── Stats ────────────────────────────────────────────────────
  async getStats(orgId: string) {
    const [total, inProgress, submitted, approved] = await Promise.all([
      this.asmRepo.count({ where: { organization_id: orgId } }),
      this.asmRepo.count({ where: { organization_id: orgId, status: 'in_progress' } }),
      this.asmRepo.count({ where: { organization_id: orgId, status: 'submitted' } }),
      this.asmRepo.count({ where: { organization_id: orgId, status: 'approved' } }),
    ])
    const overdue = await this.asmRepo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
      .andWhere('a.due_date < NOW()')
      .andWhere("a.status NOT IN ('approved','closed','rejected')")
      .getCount()
    return { total, in_progress: inProgress, submitted, overdue, approved }
  }
}
