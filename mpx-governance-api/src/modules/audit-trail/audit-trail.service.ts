import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditTrail } from '../../database/entities/audit-trail.entity'
import { chainHash, GENESIS } from '../../common/logging/hash-chain'

@Injectable()
export class AuditTrailService {
  constructor(@InjectRepository(AuditTrail) private repo: Repository<AuditTrail>) {}

  private fields(e: Partial<AuditTrail>) {
    return {
      organization_id: e.organization_id, action: e.action,
      object_type: e.object_type, object_id: e.object_id,
      user_id: e.user_id, new_value: e.new_value,
    }
  }

  async log(entry: {
    organization_id: string
    action: string
    object_type: string
    object_id: string
    old_value?: Record<string, unknown>
    new_value?: Record<string, unknown>
    user_id?: string
    user_email?: string
    ip_address?: string
    remark?: string
  }) {
    const last = await this.repo.findOne({ where: {}, order: { created_at: 'DESC' } })
    const prev_hash = last?.hash || GENESIS
    const hash = chainHash(prev_hash, this.fields(entry))
    return this.repo.save(this.repo.create({ ...entry, prev_hash, hash }))
  }

  async resealLegacy() {
    const all = await this.repo.find({ order: { created_at: 'ASC' } })
    let prev = GENESIS, sealed = 0
    for (const r of all) {
      const hash = chainHash(prev, this.fields(r))
      if (r.prev_hash !== prev || r.hash !== hash) {
        await this.repo.update({ id: r.id }, { prev_hash: prev, hash }); sealed++
      }
      prev = hash
    }
    return { sealed, total: all.length, head_hash: prev }
  }

  async verifyChain() {
    const all = await this.repo.find({ order: { created_at: 'ASC' } })
    let prev = GENESIS
    for (const r of all) {
      const expected = chainHash(prev, this.fields(r))
      if (r.prev_hash !== prev || r.hash !== expected) return { valid: false, total: all.length, broken_at: r.id }
      prev = r.hash
    }
    return { valid: true, total: all.length, head_hash: prev }
  }

  findAll(orgId: string, objectType?: string) {
    const where: any = { organization_id: orgId }
    if (objectType) where.object_type = objectType
    return this.repo.find({ where, order: { created_at: 'DESC' }, take: 500 })
  }

  findByObject(objectType: string, objectId: string, orgId: string) {
    return this.repo.find({
      where: { object_type: objectType, object_id: objectId, organization_id: orgId },
      order: { created_at: 'DESC' },
    })
  }
}
