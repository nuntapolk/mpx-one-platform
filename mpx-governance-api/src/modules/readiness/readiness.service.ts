import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ScoreSnapshot } from '../../database/entities/score-snapshot.entity'
import { ScoreComponent } from '../../database/entities/score-component.entity'
import { ModuleScore } from '../../database/entities/module-score.entity'
import { UnitScore } from '../../database/entities/unit-score.entity'
import { ScoreMethodologyVersion } from '../../database/entities/score-methodology-version.entity'
import { ScoringService } from './scoring.service'
import { statusOf, DEFAULT_WEIGHTS, THRESHOLDS } from './readiness.constants'

function period(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const num = (v: any) => v == null ? 0 : Math.round(Number(v) * 100) / 100

@Injectable()
export class ReadinessService {
  constructor(
    private readonly scoring: ScoringService,
    @InjectRepository(ScoreSnapshot) private snapRepo: Repository<ScoreSnapshot>,
    @InjectRepository(ScoreComponent) private compRepo: Repository<ScoreComponent>,
    @InjectRepository(ModuleScore) private modRepo: Repository<ModuleScore>,
    @InjectRepository(UnitScore) private unitRepo: Repository<UnitScore>,
    @InjectRepository(ScoreMethodologyVersion) private methRepo: Repository<ScoreMethodologyVersion>,
  ) {}

  // Latest snapshot for org; auto-calculate one if none exists yet.
  private async latest(org: string, p: string): Promise<ScoreSnapshot> {
    let snap = await this.snapRepo.findOne({ where: { tenant_id: org, is_latest: true } as any, order: { calculated_at: 'DESC' } })
    if (!snap) snap = await this.scoring.recalculate(org, p)
    return snap
  }

  private async meta(snap: ScoreSnapshot, scope: any) {
    const meth = snap.methodology_version_id ? await this.methRepo.findOne({ where: { id: snap.methodology_version_id } }) : null
    return { scope, methodology_version: meth?.version_code || 'v1.0', calculated_at: snap.calculated_at, warnings: snap.warnings_json || [] }
  }

  async overview(org: string, p = period()) {
    const snap = await this.latest(org, p)
    const gaps = await this.scoring.gapSummary(org)
    const actions = await this.scoring.actionSummary(org)
    return {
      data: {
        overall_score: num(snap.overall_score), compliance_score: num(snap.compliance_score),
        control_evidence_score: num(snap.control_evidence_score), operational_score: num(snap.operational_score),
        status: statusOf(num(snap.overall_score)),
        summary: {
          critical_gaps: gaps.summary.critical, high_gaps: gaps.summary.high,
          medium_gaps: gaps.summary.medium, low_gaps: gaps.summary.low,
          open_actions: actions.summary.open_actions, overdue_actions: actions.summary.overdue_actions,
        },
      },
      meta: await this.meta(snap, { assessment_period: p, profile_level: snap.profile_level }),
    }
  }

  async components(org: string, p = period()) {
    const snap = await this.latest(org, p)
    const comps = await this.compRepo.find({ where: { score_snapshot_id: snap.id } })
    return {
      data: comps.map(c => ({
        component_code: c.component_code, component_name: c.component_name,
        weight_percent: num(c.weight_percent), raw_score: num(c.raw_score),
        weighted_score: num(c.weighted_score), status: c.score_status,
      })),
      meta: await this.meta(snap, { assessment_period: p }),
    }
  }

  async modules(org: string, p = period()) {
    const snap = await this.latest(org, p)
    const mods = await this.modRepo.find({ where: { score_snapshot_id: snap.id } })
    return {
      data: mods.map(m => ({
        module_code: m.module_code, module_name: m.module_name, score: num(m.module_score), status: m.status,
        completed_count: m.completed_count, incomplete_count: m.incomplete_count, overdue_count: m.overdue_count, total_count: m.total_count,
      })),
      meta: await this.meta(snap, { assessment_period: p }),
    }
  }

  async units(org: string, p = period()) {
    const snap = await this.latest(org, p)
    const units = await this.unitRepo.find({ where: { score_snapshot_id: snap.id } })
    return {
      data: units.map(u => ({
        organization_unit_id: u.organization_unit_id, organization_unit_name: u.organization_unit_name,
        readiness_score: num(u.readiness_score), compliance_score: num(u.compliance_score),
        control_evidence_score: num(u.control_evidence_score), operational_score: num(u.operational_score),
        incomplete_records: u.incomplete_records, open_actions: u.open_actions, overdue_actions: u.overdue_actions,
        risk_status: u.risk_status,
      })),
      meta: await this.meta(snap, { assessment_period: p }),
    }
  }

  async gaps(org: string, p = period()) {
    const snap = await this.latest(org, p)
    return { data: await this.scoring.gapSummary(org), meta: await this.meta(snap, { assessment_period: p }) }
  }

  async actions(org: string, p = period()) {
    const snap = await this.latest(org, p)
    return { data: await this.scoring.actionSummary(org), meta: await this.meta(snap, { assessment_period: p }) }
  }

  async methodology(org: string) {
    const meth = await this.methRepo.findOne({ where: { is_active: true }, order: { effective_from: 'DESC' } })
    return {
      data: {
        version_code: meth?.version_code || 'v1.0',
        description: meth?.description || 'Default PDPA readiness scoring model',
        weights: meth?.weight_config || DEFAULT_WEIGHTS,
        thresholds: meth?.threshold_config || THRESHOLDS,
      },
      meta: { scope: {}, methodology_version: meth?.version_code || 'v1.0', calculated_at: new Date(), warnings: [] },
    }
  }

  async recalculate(org: string, p = period(), userId?: string) {
    const snap = await this.scoring.recalculate(org, p, userId)
    return { data: { snapshot_id: snap.id, status: 'completed', overall_score: num(snap.overall_score) }, meta: {} }
  }
}
