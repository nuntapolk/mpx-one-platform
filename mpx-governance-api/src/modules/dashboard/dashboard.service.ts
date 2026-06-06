import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { Assessment } from '../../database/entities/assessment.entity'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'
import { Evidence } from '../../database/entities/evidence.entity'
import { Control } from '../../database/entities/control.entity'
import { Framework } from '../../database/entities/framework.entity'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RiskRegister) private riskRepo: Repository<RiskRegister>,
    @InjectRepository(Assessment)   private asmRepo:  Repository<Assessment>,
    @InjectRepository(Issue)        private issRepo:   Repository<Issue>,
    @InjectRepository(ActionPlan)   private actRepo:   Repository<ActionPlan>,
    @InjectRepository(Evidence)     private evdRepo:   Repository<Evidence>,
    @InjectRepository(Control)      private ctlRepo:   Repository<Control>,
    @InjectRepository(Framework)    private fwRepo:    Repository<Framework>,
  ) {}

  // ── Executive Dashboard ──────────────────────────────────────
  async getExecutiveSummary(orgId: string) {
    const [
      totalRisks, openRisks, totalIssues, openIssues,
      totalAssessments, approvedAssessments, totalEvidences, acceptedEvidences,
      totalControls,
    ] = await Promise.all([
      this.riskRepo.count({ where: { organization_id: orgId } }),
      this.riskRepo.count({ where: { organization_id: orgId, status: 'open' } }),
      this.issRepo.count({ where: { organization_id: orgId } }),
      this.issRepo.count({ where: { organization_id: orgId, status: 'open' } }),
      this.asmRepo.count({ where: { organization_id: orgId } }),
      this.asmRepo.count({ where: { organization_id: orgId, status: 'approved' } }),
      this.evdRepo.count({ where: { organization_id: orgId } }),
      this.evdRepo.count({ where: { organization_id: orgId, status: 'accepted' } }),
      this.ctlRepo.count({ where: { organization_id: orgId } }),
    ])

    const highRisks = await this.riskRepo.createQueryBuilder('r')
      .where('r.organization_id = :orgId', { orgId })
      .andWhere("r.status = 'open'")
      .andWhere('r.likelihood * r.impact >= 12')
      .getCount()

    const criticalIssues = await this.issRepo.createQueryBuilder('i')
      .where('i.organization_id = :orgId', { orgId })
      .andWhere("i.severity IN ('critical','high')")
      .andWhere("i.status NOT IN ('closed','resolved')")
      .getCount()

    const overdueActions = await this.actRepo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
      .andWhere('a.due_date < NOW()')
      .andWhere("a.status NOT IN ('completed','cancelled')")
      .getCount()

    const expiringEvidences = await this.evdRepo.createQueryBuilder('e')
      .where('e.organization_id = :orgId', { orgId })
      .andWhere('e.expiry_date <= NOW() + interval \'30 days\'')
      .andWhere("e.status NOT IN ('expired','archived')")
      .getCount()

    // Governance score = weighted average of key metrics
    const assessmentScore  = totalAssessments > 0 ? (approvedAssessments / totalAssessments) * 100 : 0
    const evidenceScore    = totalEvidences > 0 ? (acceptedEvidences / totalEvidences) * 100 : 0
    const riskScore        = totalRisks > 0 ? Math.max(0, 100 - (highRisks / totalRisks) * 100) : 100
    const issueScore       = totalIssues > 0 ? Math.max(0, 100 - (criticalIssues / totalIssues) * 100) : 100

    const overall_score = Math.round(
      assessmentScore * 0.30 + evidenceScore * 0.25 + riskScore * 0.25 + issueScore * 0.20
    )

    const topRisks = await this.riskRepo.find({
      where: { organization_id: orgId, status: 'open' },
      order: { created_at: 'DESC' },
      take: 5,
    })
    topRisks.sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact))

    const highIssues = await this.issRepo.createQueryBuilder('i')
      .where('i.organization_id = :orgId', { orgId })
      .andWhere("i.severity IN ('critical','high')")
      .andWhere("i.status NOT IN ('closed','resolved')")
      .orderBy('i.created_at', 'DESC')
      .limit(5)
      .getMany()

    return {
      overall_score,
      governance_modules: [
        { name: 'Risk Management',   score: Math.round(riskScore),       color: '#EF9F27' },
        { name: 'Assessments',       score: Math.round(assessmentScore), color: '#378ADD' },
        { name: 'Evidence Coverage', score: Math.round(evidenceScore),   color: '#1D9E75' },
        { name: 'Issue Resolution',  score: Math.round(issueScore),      color: '#7F77DD' },
      ],
      kpis: {
        risks:      { total: totalRisks, open: openRisks, high: highRisks },
        issues:     { total: totalIssues, open: openIssues, critical: criticalIssues },
        assessments: { total: totalAssessments, approved: approvedAssessments },
        evidences:  { total: totalEvidences, accepted: acceptedEvidences, expiring: expiringEvidences },
        controls:   { total: totalControls },
        actions:    { overdue: overdueActions },
      },
      top_risks:    topRisks.slice(0, 5).map(r => ({ id: r.id, title: r.title, score: r.likelihood * r.impact, category: r.category })),
      high_issues:  highIssues.map(i => ({ id: i.id, title: i.title, severity: i.severity, type: i.type })),
    }
  }

  // ── Governance Operation Dashboard ──────────────────────────
  async getOperationSummary(orgId: string) {
    const [asmInProgress, asmOverdue, evdPendingReview, overdueActions] = await Promise.all([
      this.asmRepo.count({ where: { organization_id: orgId, status: 'in_progress' } }),
      this.asmRepo.createQueryBuilder('a')
        .where('a.organization_id = :orgId', { orgId })
        .andWhere('a.due_date < NOW()')
        .andWhere("a.status NOT IN ('approved','closed','rejected')")
        .getCount(),
      this.evdRepo.count({ where: { organization_id: orgId, status: 'submitted' } }),
      this.actRepo.createQueryBuilder('a')
        .where('a.organization_id = :orgId', { orgId })
        .andWhere('a.due_date < NOW()')
        .andWhere("a.status NOT IN ('completed','cancelled')")
        .getCount(),
    ])

    const controlsWithoutEvidence = await this.ctlRepo.count({ where: { organization_id: orgId, status: 'active' } })
    const risksWithoutTreatment   = await this.riskRepo.count({ where: { organization_id: orgId, status: 'open', treatment: 'accept' } })
    const issuesPendingClosure    = await this.issRepo.count({ where: { organization_id: orgId, status: 'pending_review' } })
    const frameworks              = await this.fwRepo.count({ where: { organization_id: orgId, status: 'active' } })

    return {
      assessments:     { in_progress: asmInProgress, overdue: asmOverdue },
      evidences:       { pending_review: evdPendingReview },
      controls:        { total_active: controlsWithoutEvidence },
      risks:           { without_treatment: risksWithoutTreatment },
      issues:          { pending_closure: issuesPendingClosure },
      actions:         { overdue: overdueActions },
      frameworks:      { active: frameworks },
    }
  }

  // ── Legacy summary ────────────────────────────────────────────
  async getSummary(orgId: string) {
    return this.getExecutiveSummary(orgId)
  }
}
