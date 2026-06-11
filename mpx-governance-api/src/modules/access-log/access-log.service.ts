import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AccessLog } from '../../database/entities/access-log.entity'
import { logger } from '../../common/logging/logger'
import { chainHash, GENESIS } from '../../common/logging/hash-chain'

@Injectable()
export class AccessLogService {
  constructor(@InjectRepository(AccessLog) private repo: Repository<AccessLog>) {}

  private hashedFields(e: Partial<AccessLog>) {
    return {
      organization_id: e.organization_id, category: e.category, action: e.action,
      resource_type: e.resource_type, resource_id: e.resource_id, user_id: e.user_id,
      user_email: e.user_email, endpoint: e.endpoint, outcome: e.outcome,
      pii_categories: e.pii_categories, request_id: e.request_id,
    }
  }

  // Fire-and-forget write — never block the request being logged.
  async record(entry: Partial<AccessLog>) {
    try {
      const last = await this.repo.findOne({ where: {}, order: { created_at: 'DESC' } })
      const prev_hash = last?.hash || GENESIS
      const hash = chainHash(prev_hash, this.hashedFields(entry))
      await this.repo.save(this.repo.create({ ...entry, prev_hash, hash }))
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

  // One-time baseline seal: (re)compute the full chain from genesis in time order.
  // Run once at deployment to establish integrity over pre-existing rows.
  async resealLegacy() {
    const all = await this.repo.find({ order: { created_at: 'ASC' } })
    let prev = GENESIS, sealed = 0
    for (const r of all) {
      const hash = chainHash(prev, this.hashedFields(r))
      if (r.prev_hash !== prev || r.hash !== hash) {
        await this.repo.update({ id: r.id }, { prev_hash: prev, hash }); sealed++
      }
      prev = hash
    }
    return { sealed, total: all.length, head_hash: prev }
  }

  // Walk the full chain and recompute hashes to detect tampering.
  async verifyChain() {
    const all = await this.repo.find({ order: { created_at: 'ASC' } })
    let prev = GENESIS
    for (const r of all) {
      const expected = chainHash(prev, this.hashedFields(r))
      if (r.prev_hash !== prev || r.hash !== expected) {
        return { valid: false, total: all.length, broken_at: r.id, broken_created_at: r.created_at }
      }
      prev = r.hash
    }
    return { valid: true, total: all.length, head_hash: prev }
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
