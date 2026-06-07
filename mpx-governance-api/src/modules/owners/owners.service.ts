import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OwnerAssignment } from '../../database/entities/owner-assignment.entity'

@Injectable()
export class OwnersService {
  constructor(@InjectRepository(OwnerAssignment) private repo: Repository<OwnerAssignment>) {}

  forObject(objectType: string, objectId: string, orgId: string) {
    return this.repo.find({ where: { organization_id: orgId, object_type: objectType, object_id: objectId } })
  }

  assign(body: Partial<OwnerAssignment>, orgId: string) {
    return this.repo.save(this.repo.create({ ...body, organization_id: orgId }))
  }

  remove(id: string, orgId: string) {
    return this.repo.delete({ id, organization_id: orgId })
  }

  // Owner types reference (M01-FR04)
  ownerTypes() {
    return ['business_owner', 'system_owner', 'data_owner', 'data_steward', 'risk_owner',
      'control_owner', 'evidence_owner', 'project_owner', 'vendor_owner', 'ai_use_case_owner',
      'reviewer', 'approver']
  }

  async summary(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const byType: Record<string, number> = {}
    for (const a of all) byType[a.owner_type] = (byType[a.owner_type] ?? 0) + 1
    return { total_assignments: all.length, by_owner_type: byType }
  }
}
