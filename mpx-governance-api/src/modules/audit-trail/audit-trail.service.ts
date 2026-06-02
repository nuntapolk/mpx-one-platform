import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditTrail } from '../../database/entities/audit-trail.entity'

@Injectable()
export class AuditTrailService {
  constructor(@InjectRepository(AuditTrail) private repo: Repository<AuditTrail>) {}

  log(entry: {
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
    return this.repo.save(this.repo.create(entry))
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
