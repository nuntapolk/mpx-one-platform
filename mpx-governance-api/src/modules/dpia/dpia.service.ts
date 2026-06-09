import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Dpia } from '../../database/entities/dpia.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'

@Injectable()
export class DpiaService {
  constructor(
    @InjectRepository(Dpia)         private repo: Repository<Dpia>,
    @InjectRepository(RopaActivity) private ropaRepo: Repository<RopaActivity>,
  ) {}

  async findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const d = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!d) throw new NotFoundException(`DPIA ${id} not found`)
    let ropa = null
    if (d.ropa_record_id) {
      ropa = await this.ropaRepo.findOne({ where: { id: d.ropa_record_id } })
    }
    return { ...d, ropa }
  }

  async create(body: Partial<Dpia>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const num = body.dpia_number || `DPIA-${year}-${String(count + 1).padStart(4, '0')}`
    const saved = await this.repo.save(this.repo.create({
      ...body, dpia_number: num, organization_id: orgId, status: body.status || 'screening',
    }))
    // sync flag back to ROPA
    if (saved.ropa_record_id) {
      await this.ropaRepo.update({ id: saved.ropa_record_id }, {
        dpia_required_flag: true, dpia_status: 'in_progress', dpia_id: saved.id,
      })
    }
    return saved
  }

  async update(id: string, body: Partial<Dpia>, orgId: string) {
    await this.findOne(id, orgId)
    // auto: high residual risk → consultation required
    if (body.residual_risk_level === 'high' || body.residual_risk_level === 'critical') {
      body.consultation_required = true
    }
    await this.repo.update({ id, organization_id: orgId }, body as any)
    return this.findOne(id, orgId)
  }

  async transition(id: string, status: string, orgId: string) {
    const d = await this.findOne(id, orgId)
    const patch: any = { status }
    if (status === 'completed') patch.completed_at = new Date()
    if (status === 'approved') patch.approved_at = new Date()
    await this.repo.update({ id }, patch)
    // sync ROPA dpia_status
    if (d.ropa_record_id) {
      const ropaStatus = status === 'completed' || status === 'approved' ? 'completed' : 'in_progress'
      await this.ropaRepo.update({ id: d.ropa_record_id }, { dpia_status: ropaStatus })
    }
    return this.findOne(id, orgId)
  }

  async consultPdpc(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { pdpc_consulted_at: new Date() })
    return this.findOne(id, orgId)
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    let screening = 0, inProgress = 0, completed = 0, highResidual = 0, needConsult = 0
    for (const d of all) {
      if (d.status === 'screening') screening++
      else if (['in_progress', 'under_review'].includes(d.status)) inProgress++
      else if (['completed', 'approved'].includes(d.status)) completed++
      if (['high', 'critical'].includes(d.residual_risk_level)) highResidual++
      if (d.consultation_required && !d.pdpc_consulted_at) needConsult++
    }
    return { total: all.length, screening, in_progress: inProgress, completed, high_residual: highResidual, need_pdpc_consult: needConsult }
  }

  // ROPA records that need DPIA but don't have one yet
  async candidates(orgId: string) {
    const ropas = await this.ropaRepo.find({ where: { organization_id: orgId, dpia_required_flag: true } })
    const dpias = await this.repo.find({ where: { organization_id: orgId } })
    const covered = new Set(dpias.map(d => d.ropa_record_id).filter(Boolean))
    return ropas.filter(r => !covered.has(r.id)).map(r => ({ id: r.id, ropa_code: r.ropa_code, processing_activity_name: r.processing_activity_name, risk_level: r.risk_level }))
  }
}
