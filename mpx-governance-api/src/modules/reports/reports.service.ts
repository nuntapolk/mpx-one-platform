import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Dpia } from '../../database/entities/dpia.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { BreachIncident } from '../../database/entities/breach-incident.entity'
import { Consent } from '../../database/entities/consent.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { TrainingCourse } from '../../database/entities/training-course.entity'
import { TrainingCompletion } from '../../database/entities/training-completion.entity'

const tally = <T>(rows: T[], key: (r: T) => string | null | undefined): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const r of rows) { const k = key(r); if (k) out[k] = (out[k] || 0) + 1 }
  return out
}
const riskLabel = (score: number | null | undefined): string => {
  const s = score ?? 0
  if (s >= 20) return 'critical'
  if (s >= 15) return 'high'
  if (s >= 8) return 'medium'
  return 'low'
}
const monthKey = (d: Date | string | null): string | null => {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return null
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
const last12Months = (rows: { created_at: Date }[]): Record<string, number> => {
  const out: Record<string, number> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0
  }
  for (const r of rows) { const k = monthKey(r.created_at); if (k && k in out) out[k]++ }
  return out
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(RopaActivity) private ropa: Repository<RopaActivity>,
    @InjectRepository(Dpia) private dpia: Repository<Dpia>,
    @InjectRepository(RightsRequest) private dsar: Repository<RightsRequest>,
    @InjectRepository(BreachIncident) private breach: Repository<BreachIncident>,
    @InjectRepository(Consent) private consent: Repository<Consent>,
    @InjectRepository(RiskRegister) private risk: Repository<RiskRegister>,
    @InjectRepository(TrainingCourse) private course: Repository<TrainingCourse>,
    @InjectRepository(TrainingCompletion) private completion: Repository<TrainingCompletion>,
  ) {}

  private async loadAll(orgId: string) {
    const where = { organization_id: orgId }
    const [ropa, dpia, dsar, breach, consent, risk, courses, completions] = await Promise.all([
      this.ropa.find({ where }),
      this.dpia.find({ where }),
      this.dsar.find({ where }),
      this.breach.find({ where }),
      this.consent.find({ where }),
      this.risk.find({ where }),
      this.course.find({ where }),
      this.completion.find({ where }),
    ])
    return { ropa, dpia, dsar, breach, consent, risk, courses, completions }
  }

  async getReport(orgId: string) {
    const now = Date.now()
    const d = await this.loadAll(orgId)

    // ── ROPA ──
    const ropaTotal = d.ropa.length
    const ropaByStatus = tally(d.ropa, r => r.status)
    const ropaByLawful = tally(d.ropa, r => r.lawful_basis)
    const ropaByRisk = tally(d.ropa, r => r.risk_level)
    const ropaCritical = d.ropa.filter(r => ['critical', 'high'].includes(r.auto_priority || r.risk_level)).length
    const ropaDpiaReq = d.ropa.filter(r => r.dpia_required).length

    // ── DSAR ──
    const closedDsar = d.dsar.filter(r => ['completed', 'rejected'].includes(r.status))
    const onTime = closedDsar.filter(r => r.completed_at && r.due_date && new Date(r.completed_at) <= new Date(r.due_date)).length
    const dsrOverdue = d.dsar.filter(r => !['completed', 'rejected', 'withdrawn'].includes(r.status) && r.due_date && new Date(r.due_date).getTime() < now).length

    // ── Breach ──
    const breachOpen = d.breach.filter(r => !['resolved', 'closed'].includes(r.status)).length
    const breachOverdue72h = d.breach.filter(r =>
      !['resolved', 'closed', 'notified'].includes(r.status) &&
      r.pdpc_notification_deadline && new Date(r.pdpc_notification_deadline).getTime() < now && !r.pdpc_notified_at).length

    // ── Risk ──
    const riskByLevel = tally(d.risk, r => riskLabel((r as any).inherent_score))
    const riskCritical = d.risk.filter(r => ((r as any).inherent_score ?? 0) >= 20).length
    const riskHigh = d.risk.filter(r => { const s = (r as any).inherent_score ?? 0; return s >= 15 && s < 20 }).length
    const riskAccepted = d.risk.filter(r => r.status === 'accepted').length

    // ── Consent ──
    const activeConsents = d.consent.filter(c => c.granted && !c.withdrawn_at && (!c.expires_at || new Date(c.expires_at).getTime() > now)).length

    // ── Training ──
    const completedUsers = new Set(d.completions.filter(c => c.passed).map(c => c.user_id)).size

    // ── DPIA ──
    const dpiaApproved = d.dpia.filter(x => ['approved', 'completed'].includes(x.status)).length
    const dpiaPending = d.dpia.length - dpiaApproved

    // ── Compliance score (weighted) ──
    const ropaScore = ropaTotal ? Math.round((ropaByStatus['active'] || 0) / ropaTotal * 100) : 0
    const dsrScore = closedDsar.length ? Math.round(onTime / closedDsar.length * 100) : 100
    const breachScore = d.breach.length ? Math.round((d.breach.length - breachOverdue72h) / d.breach.length * 100) : 100
    const dpiaScore = d.dpia.length ? Math.round(dpiaApproved / d.dpia.length * 100) : 100
    const complianceScore = Math.round((ropaScore + dsrScore + breachScore + dpiaScore) / 4)

    return {
      generated_at: new Date().toISOString(),
      // Executive governance pack
      governance: {
        compliance_score: complianceScore,
        ropa: { total: ropaTotal, by_status: ropaByStatus, critical: ropaCritical, dpia_required: ropaDpiaReq },
        dsar: { total: d.dsar.length, pending: d.dsar.filter(r => r.status === 'pending').length, overdue: dsrOverdue, closed: closedDsar.length, sla_rate: closedDsar.length ? Math.round(onTime / closedDsar.length * 100) : null, by_type: tally(d.dsar, r => r.type) },
        breach: { total: d.breach.length, open: breachOpen, resolved: d.breach.length - breachOpen, overdue_72h: breachOverdue72h, by_severity: tally(d.breach, r => (r as any).severity) },
        consent: { active: activeConsents, total: d.consent.length },
        risk: riskByLevel,
        dpia: { total: d.dpia.length, approved: dpiaApproved, pending: dpiaPending },
        training: { courses: d.courses.length, completed_users: completedUsers },
      },
      // Analytics charts
      analytics: {
        kpis: {
          ropa_total: ropaTotal, ropa_active: ropaByStatus['active'] || 0,
          risk_high: riskHigh, risk_critical: riskCritical,
          dsr_pending: d.dsar.filter(r => r.status === 'pending').length, dsr_overdue: dsrOverdue,
          breach_total: d.breach.length, dpia_required: ropaDpiaReq,
        },
        ropa_by_status: ropaByStatus,
        ropa_by_lawful: ropaByLawful,
        ropa_by_risk: ropaByRisk,
        ropa_trend: last12Months(d.ropa as any),
        risk_by_level: riskByLevel,
        risk_trend: last12Months(d.risk as any),
        dsr_by_type: tally(d.dsar, r => r.type),
        dsr_by_status: tally(d.dsar, r => r.status),
        breach_by_severity: tally(d.breach, r => (r as any).severity),
        dpia_by_status: tally(d.dpia, r => r.status),
      },
      // Enterprise repository — cross-module summary
      repository: {
        ropa: { total: ropaTotal, active: ropaByStatus['active'] || 0, draft: ropaByStatus['draft'] || 0, dpia_req: ropaDpiaReq },
        dpia: { total: d.dpia.length, approved: dpiaApproved, pending: dpiaPending },
        risk: { total: d.risk.length, critical: riskCritical, high: riskHigh, accepted: riskAccepted },
        dsar: { total: d.dsar.length, pending: d.dsar.filter(r => r.status === 'pending').length, overdue: dsrOverdue },
        breach: { total: d.breach.length, open: breachOpen, overdue_72h: breachOverdue72h },
        consent: { active: activeConsents, total: d.consent.length },
        training: { courses: d.courses.length, completed_users: completedUsers },
      },
    }
  }
}
