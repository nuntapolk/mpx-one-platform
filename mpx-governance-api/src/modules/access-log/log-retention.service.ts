import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, Repository } from 'typeorm'
import { AccessLog } from '../../database/entities/access-log.entity'
import { AuditTrail } from '../../database/entities/audit-trail.entity'
import { logger } from '../../common/logging/logger'

// Retention periods (days) per log category — override via env.
// Defaults reflect the logging design: PII/DSAR/consent kept longest.
const RETENTION_DAYS = {
  pii_access: Number(process.env.RETENTION_PII_DAYS || 1095),   // 3y
  export: Number(process.env.RETENTION_EXPORT_DAYS || 1095),    // 3y
  dsar: Number(process.env.RETENTION_DSAR_DAYS || 1095),        // 3y
  consent: Number(process.env.RETENTION_CONSENT_DAYS || 1095),  // 3y
  authorization: Number(process.env.RETENTION_SECURITY_DAYS || 730), // 2y (security)
  audit: Number(process.env.RETENTION_AUDIT_DAYS || 2555),      // 7y (accountability)
}

@Injectable()
export class LogRetentionService {
  constructor(
    @InjectRepository(AccessLog) private access: Repository<AccessLog>,
    @InjectRepository(AuditTrail) private audit: Repository<AuditTrail>,
  ) {}

  private cutoff(days: number) { return new Date(Date.now() - days * 864e5) }

  // Runs daily at 03:00. Deletes log records older than their category's retention.
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purge() {
    const result: Record<string, number> = {}
    for (const [cat, days] of Object.entries(RETENTION_DAYS)) {
      if (cat === 'audit') continue
      const r = await this.access.delete({ category: cat, created_at: LessThan(this.cutoff(days)) as any })
      if (r.affected) result[cat] = r.affected
    }
    const a = await this.audit.delete({ created_at: LessThan(this.cutoff(RETENTION_DAYS.audit)) as any })
    if (a.affected) result['audit'] = a.affected
    if (Object.keys(result).length) logger.info({ category: 'system', retention: result }, 'log retention purge completed')
    return { purged: result, policy_days: RETENTION_DAYS }
  }

  policy() { return RETENTION_DAYS }
}
