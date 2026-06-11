import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AccessLog } from '../../database/entities/access-log.entity'
import { logger } from '../../common/logging/logger'

@Injectable()
export class AccessLogService {
  constructor(@InjectRepository(AccessLog) private repo: Repository<AccessLog>) {}

  // Fire-and-forget write — never block the request being logged.
  async record(entry: Partial<AccessLog>) {
    try {
      await this.repo.save(this.repo.create(entry))
      logger.info({
        category: entry.category, request_id: entry.request_id, action: entry.action,
        resource: { type: entry.resource_type, id: entry.resource_id, pii_categories: entry.pii_categories },
        actor: { user_id: entry.user_id, email: entry.user_email, roles: entry.user_roles, org_id: entry.organization_id },
        ip: entry.ip_address, endpoint: entry.endpoint, outcome: entry.outcome, record_count: entry.record_count,
      }, `pii ${entry.action} ${entry.resource_type}`)
    } catch (e: any) {
      logger.error({ err: e?.message }, 'access-log write failed')
    }
  }

  async findAll(orgId: string, q: { resource_type?: string; action?: string; user_email?: string; limit?: number }) {
    const qb = this.repo.createQueryBuilder('a')
      .where('a.organization_id = :orgId', { orgId })
    if (q.resource_type) qb.andWhere('a.resource_type = :rt', { rt: q.resource_type })
    if (q.action) qb.andWhere('a.action = :ac', { ac: q.action })
    if (q.user_email) qb.andWhere('a.user_email ILIKE :ue', { ue: `%${q.user_email}%` })
    return qb.orderBy('a.created_at', 'DESC').limit(Math.min(q.limit ?? 200, 1000)).getMany()
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const tally = (k: (a: AccessLog) => string) => {
      const o: Record<string, number> = {}; for (const a of all) { const v = k(a); if (v) o[v] = (o[v] ?? 0) + 1 } return o
    }
    return {
      total: all.length,
      exports: all.filter(a => a.category === 'export').length,
      pii_sensitive: all.filter(a => (a.pii_categories || []).some(c => ['national_id', 'health', 'biometric', 'criminal'].includes(c))).length,
      by_action: tally(a => a.action),
      by_resource: tally(a => a.resource_type),
    }
  }
}
