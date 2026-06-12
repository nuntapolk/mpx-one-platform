import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiAssessment } from '../../database/entities/ai-assessment.entity'
import { AIUseCase } from '../../database/entities/ai-use-case.entity'
import { AI_STEPS, SCORE_DOMAINS, phaseOf } from './ai-steps'

@Injectable()
export class AiAssessmentService {
  constructor(
    @InjectRepository(AiAssessment) private repo: Repository<AiAssessment>,
    @InjectRepository(AIUseCase) private useCases: Repository<AIUseCase>,
  ) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const a = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!a) throw new NotFoundException('AiAssessment ' + id + ' not found')
    return a
  }

  // Auto risk-tier from linked AI use case flags (or default medium)
  private async autoTier(useCaseId?: string, orgId?: string): Promise<string> {
    if (!useCaseId) return 'medium'
    const uc: any = await this.useCases.findOne({ where: { id: useCaseId, organization_id: orgId } })
    if (!uc) return 'medium'
    let score = 0
    if (uc.sensitive_data_used_flag) score += 2
    if (uc.personal_data_used_flag) score += 1
    if (uc.external_ai_tool_flag) score += 1
    if (!uc.human_oversight_required_flag) score += 1
    return score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low'
  }

  async create(body: any, orgId: string) {
    const year = new Date().getFullYear()
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const code = body.assessment_code || `AIA-${year}-${String(count + 1).padStart(3, '0')}`
    const steps = AI_STEPS.map(s => ({ no: s.no, status: s.no === 1 ? 'in_progress' : 'pending' }))
    const risk_tier = body.risk_tier || await this.autoTier(body.ai_use_case_id, orgId)
    return this.repo.save(this.repo.create({
      ...body, assessment_code: code, organization_id: orgId,
      current_step: 1, phase: 'intake', status: 'in_progress', risk_tier,
      scores: body.scores || {}, steps, guardrails: body.guardrails || defaultGuardrails(),
      regulatory: body.regulatory || [],
    }))
  }

  async update(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    const patch: any = { ...body }
    if (body.scores) patch.consolidated_score = consolidate(body.scores)
    await this.repo.update({ id, organization_id: orgId }, patch)
    return this.findOne(id, orgId)
  }

  // Advance / set a step's state
  async setStep(id: string, stepNo: number, body: any, orgId: string) {
    const a = await this.findOne(id, orgId)
    const steps = Array.isArray(a.steps) ? [...a.steps] : []
    const idx = steps.findIndex(s => s.no === stepNo)
    const next = { no: stepNo, status: body.status || 'completed', notes: body.notes, evidence: body.evidence, completed_at: body.status === 'completed' ? new Date().toISOString() : undefined }
    if (idx >= 0) steps[idx] = { ...steps[idx], ...next }
    else steps.push(next)
    // advance current_step to first non-completed
    const firstOpen = AI_STEPS.find(d => { const st = steps.find(s => s.no === d.no); return !st || st.status !== 'completed' })
    const current = firstOpen?.no ?? 21
    await this.repo.update({ id, organization_id: orgId }, { steps, current_step: current, phase: phaseOf(current) })
    return this.findOne(id, orgId)
  }

  async setScore(id: string, domain: string, score: number, orgId: string) {
    const a = await this.findOne(id, orgId)
    const scores = { ...(a.scores || {}), [domain]: score }
    await this.repo.update({ id, organization_id: orgId }, { scores, consolidated_score: consolidate(scores) })
    return this.findOne(id, orgId)
  }

  async decide(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    const status = body.status || 'approved'   // approved | conditional | rejected
    await this.repo.update({ id, organization_id: orgId }, {
      status, decision: body.decision, conditions: body.conditions, decided_at: new Date(),
    })
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.delete({ id, organization_id: orgId })
    return { success: true }
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const tally = (k: (a: AiAssessment) => string) => { const o: Record<string, number> = {}; for (const a of all) { const v = k(a); if (v) o[v] = (o[v] || 0) + 1 } return o }
    return {
      total: all.length,
      pending_approval: all.filter(a => a.phase === 'risk' || (a.phase === 'approval' && a.status === 'in_progress')).length,
      high_risk: all.filter(a => a.risk_tier === 'high').length,
      live: all.filter(a => a.status === 'live').length,
      by_phase: tally(a => a.phase),
      by_tier: tally(a => a.risk_tier),
      by_status: tally(a => a.status),
    }
  }
}

function consolidate(scores: Record<string, number>): number {
  const vals = SCORE_DOMAINS.map(d => scores[d]).filter(v => v != null) as number[]
  return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
}
function defaultGuardrails() {
  return [
    { key: 'sso', label: 'SSO authentication', enabled: false },
    { key: 'rbac', label: 'RBAC access control', enabled: false },
    { key: 'logging', label: 'Full audit logging', enabled: false },
    { key: 'kill_switch', label: 'Kill Switch', enabled: false },
    { key: 'hitl', label: 'Human-in-the-loop (HITL)', enabled: false },
    { key: 'data_masking', label: 'Data masking', enabled: false },
  ]
}
