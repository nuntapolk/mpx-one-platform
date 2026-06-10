import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkflowTemplate, WorkflowStep } from '../../database/entities/workflow-template.entity'
import { WorkflowInstance } from '../../database/entities/workflow-instance.entity'

const normalizeSteps = (steps: any[]): WorkflowStep[] =>
  (Array.isArray(steps) ? steps : []).map((s, i) => ({
    step: i + 1,
    name: String(s?.name || `ขั้นที่ ${i + 1}`),
    role: String(s?.role || 'reviewer'),
    sla_days: Number(s?.sla_days) || 3,
    auto_assign: !!s?.auto_assign,
    action: s?.action || 'approve',
  }))

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowTemplate) private templates: Repository<WorkflowTemplate>,
    @InjectRepository(WorkflowInstance) private instances: Repository<WorkflowInstance>,
  ) {}

  // ── Templates ──────────────────────────────────────────────
  async findAllTemplates(orgId: string) {
    const tpls = await this.templates.find({ where: { organization_id: orgId }, order: { module: 'ASC', name: 'ASC' } })
    const counts = await this.instances.createQueryBuilder('i')
      .select('i.template_id', 'tid').addSelect('COUNT(*)', 'cnt')
      .where('i.organization_id = :orgId', { orgId }).groupBy('i.template_id').getRawMany()
    const map = new Map(counts.map(c => [c.tid, Number(c.cnt)]))
    return tpls.map(t => ({ ...t, instances_count: map.get(t.id) || 0 }))
  }

  async findTemplate(id: string, orgId: string) {
    const t = await this.templates.findOne({ where: { id, organization_id: orgId } })
    if (!t) throw new NotFoundException('WorkflowTemplate ' + id + ' not found')
    return t
  }

  createTemplate(body: any, orgId: string) {
    return this.templates.save(this.templates.create({
      organization_id: orgId,
      name: body?.name, description: body?.description ?? null,
      module: body?.module || 'ropa',
      steps: normalizeSteps(body?.steps), is_active: body?.is_active ?? true,
    }))
  }

  async updateTemplate(id: string, body: any, orgId: string) {
    await this.findTemplate(id, orgId)
    const data: any = { ...body }
    if (body?.steps) data.steps = normalizeSteps(body.steps)
    await this.templates.update({ id, organization_id: orgId }, data)
    return this.findTemplate(id, orgId)
  }

  async removeTemplate(id: string, orgId: string) {
    await this.findTemplate(id, orgId)
    await this.instances.delete({ template_id: id, organization_id: orgId })
    await this.templates.delete({ id, organization_id: orgId })
    return { success: true }
  }

  // ── Instances ──────────────────────────────────────────────
  findAllInstances(orgId: string) {
    return this.instances.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async startInstance(body: any, orgId: string) {
    const tpl = await this.findTemplate(body?.template_id, orgId)
    if (!tpl.is_active) throw new BadRequestException('Template ปิดใช้งานอยู่')
    if (!tpl.steps?.length) throw new BadRequestException('Template ไม่มีขั้นตอน')
    return this.instances.save(this.instances.create({
      organization_id: orgId,
      template_id: tpl.id,
      entity_type: body?.entity_type ?? tpl.module,
      entity_id: body?.entity_id ?? null,
      subject: body?.subject ?? tpl.name,
      current_step: 1,
      status: 'active',
      step_history: [{ step: 0, actor: body?.actor || 'system', action: 'started', at: new Date().toISOString() }],
      started_at: new Date(),
    } as any))
  }

  async advanceInstance(id: string, body: any, orgId: string) {
    const inst = await this.instances.findOne({ where: { id, organization_id: orgId } })
    if (!inst) throw new NotFoundException('WorkflowInstance ' + id + ' not found')
    if (inst.status !== 'active') throw new BadRequestException('Instance นี้ไม่ได้อยู่ในสถานะ active')
    const tpl = await this.findTemplate(inst.template_id, orgId)
    const action = body?.action === 'reject' ? 'rejected' : 'approved'
    const history = Array.isArray(inst.step_history) ? [...inst.step_history] : []
    history.push({ step: inst.current_step, actor: body?.actor || 'reviewer', action, notes: body?.notes, at: new Date().toISOString() })

    const data: any = { step_history: history }
    if (action === 'rejected') {
      data.status = 'rejected'; data.completed_at = new Date()
    } else if (inst.current_step >= tpl.steps.length) {
      data.status = 'completed'; data.completed_at = new Date()
    } else {
      data.current_step = inst.current_step + 1
    }
    await this.instances.update({ id, organization_id: orgId }, data)
    return this.instances.findOne({ where: { id, organization_id: orgId } })
  }

  async cancelInstance(id: string, orgId: string) {
    const inst = await this.instances.findOne({ where: { id, organization_id: orgId } })
    if (!inst) throw new NotFoundException('WorkflowInstance ' + id + ' not found')
    await this.instances.update({ id, organization_id: orgId }, { status: 'cancelled', completed_at: new Date() })
    return { success: true }
  }

  async getStats(orgId: string) {
    const [tplCount, all] = await Promise.all([
      this.templates.count({ where: { organization_id: orgId } }),
      this.instances.find({ where: { organization_id: orgId } }),
    ])
    return {
      templates: tplCount,
      active: all.filter(i => i.status === 'active').length,
      completed: all.filter(i => i.status === 'completed').length,
      rejected: all.filter(i => i.status === 'rejected').length,
    }
  }
}
