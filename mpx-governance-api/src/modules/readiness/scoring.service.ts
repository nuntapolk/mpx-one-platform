import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ScoreSnapshot } from '../../database/entities/score-snapshot.entity'
import { ScoreComponent } from '../../database/entities/score-component.entity'
import { ModuleScore } from '../../database/entities/module-score.entity'
import { UnitScore } from '../../database/entities/unit-score.entity'
import { ScoreMethodologyVersion } from '../../database/entities/score-methodology-version.entity'
import { BusinessUnit } from '../../database/entities/business-unit.entity'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'
import {
  MODULES, DEFAULT_WEIGHTS, COMPONENT_MODULES, COMPONENT_NAMES, statusOf,
  COMPLIANCE_MODULES, CONTROL_EVIDENCE_MODULES, OPERATIONAL_MODULES,
} from './readiness.constants'

interface ModuleResult { code: string; name: string; score: number; total: number; completed: number; note?: string }

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name)
  constructor(
    private readonly ds: DataSource,
    @InjectRepository(ScoreSnapshot) private snapRepo: Repository<ScoreSnapshot>,
    @InjectRepository(ScoreComponent) private compRepo: Repository<ScoreComponent>,
    @InjectRepository(ModuleScore) private modRepo: Repository<ModuleScore>,
    @InjectRepository(UnitScore) private unitRepo: Repository<UnitScore>,
    @InjectRepository(ScoreMethodologyVersion) private methRepo: Repository<ScoreMethodologyVersion>,
    @InjectRepository(BusinessUnit) private buRepo: Repository<BusinessUnit>,
    @InjectRepository(Issue) private issueRepo: Repository<Issue>,
    @InjectRepository(ActionPlan) private actionRepo: Repository<ActionPlan>,
  ) {}

  private async safeCount(table: string, where: string, params: any[]): Promise<number> {
    try {
      const rows = await this.ds.query(`SELECT COUNT(*)::int AS c FROM "${table}" WHERE ${where}`, params)
      return rows?.[0]?.c ?? 0
    } catch (e: any) {
      this.logger.warn(`count ${table} failed: ${e.message}`)
      return 0
    }
  }

  // Module completeness % from real source tables (graceful on schema gaps).
  private async computeModules(org: string): Promise<ModuleResult[]> {
    const out: ModuleResult[] = []
    for (const m of MODULES) {
      const total = await this.safeCount(m.table, 'organization_id = $1', [org])
      let completed = total
      let note: string | undefined
      if (m.completedExpr) {
        completed = await this.safeCount(m.table, `organization_id = $1 AND (${m.completedExpr})`, [org])
      } else {
        note = 'presence-based (no status column)'
      }
      const score = total > 0 ? Math.round((completed / total) * 100) : 0
      out.push({ code: m.code, name: m.name, score, total, completed, note })
    }
    return out
  }

  private avg(mods: ModuleResult[], codes: string[]): number {
    const sel = mods.filter(m => codes.includes(m.code) && m.total > 0)
    if (!sel.length) return 0
    return Math.round(sel.reduce((s, m) => s + m.score, 0) / sel.length)
  }

  private async activeMethodology(org: string): Promise<ScoreMethodologyVersion | null> {
    return this.methRepo.findOne({ where: { is_active: true }, order: { effective_from: 'DESC' } })
  }

  // Compute + persist a snapshot for the whole org (MVP: org-level scope).
  async recalculate(org: string, period: string, userId?: string): Promise<ScoreSnapshot> {
    const meth = await this.activeMethodology(org)
    const weights = (meth?.weight_config as Record<string, number>) || DEFAULT_WEIGHTS

    const mods = await this.computeModules(org)
    const modByCode = Object.fromEntries(mods.map(m => [m.code, m]))

    // 7 weighted components
    const components = Object.keys(weights).map(code => {
      const codes = COMPONENT_MODULES[code] || []
      const raw = this.avg(mods, codes)
      const w = weights[code] ?? 0
      return { code, name: COMPONENT_NAMES[code] || code, weight: w, raw, weighted: Math.round((raw * w) / 100 * 100) / 100 }
    })

    const compliance = this.avg(mods, COMPLIANCE_MODULES)
    const controlEvidence = this.avg(mods, CONTROL_EVIDENCE_MODULES)
    const operational = this.avg(mods, OPERATIONAL_MODULES)
    const overall = Math.round(components.reduce((s, c) => s + c.weighted, 0))

    // Retire previous latest for this scope/period
    await this.snapRepo.update({ tenant_id: org, assessment_period: period, is_latest: true } as any, { is_latest: false })

    const snapEntity = this.snapRepo.create({
      tenant_id: org, assessment_period: period, profile_level: 'enterprise',
      overall_score: overall, compliance_score: compliance,
      control_evidence_score: controlEvidence, operational_score: operational,
      status: 'completed', methodology_version_id: meth?.id,
      record_count: mods.reduce((s, m) => s + m.total, 0),
      is_latest: true, calculated_at: new Date(),
      calculated_by_type: userId ? 'user' : 'system', calculated_by_user_id: userId,
    })
    const snap: ScoreSnapshot = await this.snapRepo.save(snapEntity)

    await this.compRepo.save(components.map(c => this.compRepo.create({
      score_snapshot_id: snap.id, component_code: c.code, component_name: c.name,
      weight_percent: c.weight, raw_score: c.raw, weighted_score: c.weighted, score_status: statusOf(c.raw),
    })))

    await this.modRepo.save(mods.map(m => this.modRepo.create({
      score_snapshot_id: snap.id, module_code: m.code, module_name: m.name,
      module_score: m.score, status: statusOf(m.score),
      completed_count: m.completed, incomplete_count: Math.max(0, m.total - m.completed),
      total_count: m.total,
    })))

    // Per-unit readiness (business units of org). MVP: reuse org module scores as baseline.
    const units = await this.buRepo.find({ where: { organization_id: org } as any })
    if (units.length) {
      await this.unitRepo.save(units.map(u => this.unitRepo.create({
        score_snapshot_id: snap.id, organization_unit_id: u.id, organization_unit_name: u.name,
        region_id: (u as any).region_id, province_code: (u as any).province_code, profile_level: (u as any).profile_level,
        readiness_score: overall, compliance_score: compliance,
        control_evidence_score: controlEvidence, operational_score: operational,
        risk_status: overall >= 70 ? 'low' : overall >= 50 ? 'medium' : 'high',
      })))
    }

    return snap
  }

  // Gap & action summaries reuse Issue / ActionPlan.
  async gapSummary(org: string) {
    const issues = await this.issueRepo.find({ where: { organization_id: org } as any, order: { created_at: 'DESC' } })
    const open = issues.filter(i => !['closed', 'resolved'].includes(i.status))
    const bySev = (s: string) => open.filter(i => i.severity === s).length
    return {
      summary: { critical: bySev('critical'), high: bySev('high'), medium: bySev('medium'), low: bySev('low') },
      top_gaps: open.slice(0, 10).map(i => ({
        id: i.id, gap_code: i.issue_id, title: i.title, severity: i.severity, status: i.status,
        source_module: (i as any).source_module || i.type, organization_unit_id: i.business_unit_id, due_date: i.due_date,
      })),
    }
  }

  async actionSummary(org: string) {
    const actions = await this.actionRepo.find({ where: { organization_id: org } as any, order: { due_date: 'ASC' } })
    const open = actions.filter(a => !['completed', 'cancelled'].includes(a.status))
    const now = new Date()
    const overdue = open.filter(a => a.due_date && new Date(a.due_date) < now)
    return {
      summary: { open_actions: open.length, overdue_actions: overdue.length },
      priority_actions: open
        .sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 } as any)[a.priority] - ({ critical: 0, high: 1, medium: 2, low: 3 } as any)[b.priority])
        .slice(0, 10)
        .map(a => ({ id: a.id, title: a.description, priority: a.priority, status: a.status, due_date: a.due_date, source_module: (a as any).source_module })),
    }
  }
}
