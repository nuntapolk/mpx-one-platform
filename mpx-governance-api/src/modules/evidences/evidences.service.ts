import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Evidence } from '../../database/entities/evidence.entity'
import { EvidenceLink } from '../../database/entities/evidence-link.entity'

@Injectable()
export class EvidencesService {
  constructor(
    @InjectRepository(Evidence) private repo: Repository<Evidence>,
    @InjectRepository(EvidenceLink) private linkRepo: Repository<EvidenceLink>,
  ) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Evidence ${id} not found`)
    return item
  }

  create(body: Partial<Evidence>, orgId: string) { return this.repo.save(this.repo.create({ ...body, organization_id: orgId })) }

  async update(id: string, body: Partial<Evidence>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async accept(id: string, reviewerId: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { status: 'accepted', reviewer_id: reviewerId })
    return this.findOne(id, orgId)
  }

  async reject(id: string, reviewerId: string, comment: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { status: 'rejected', reviewer_id: reviewerId, reviewer_comment: comment })
    return this.findOne(id, orgId)
  }

  getLinks(evidenceId: string) { return this.linkRepo.find({ where: { evidence_id: evidenceId } }) }
  addLink(body: Partial<EvidenceLink>) { return this.linkRepo.save(this.linkRepo.create(body)) }
  removeLink(id: string) { return this.linkRepo.delete({ id }) }

  // Get evidences expiring soon (within 30 days)
  async getExpiryAlerts(orgId: string) {
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return this.repo
      .createQueryBuilder('e')
      .where('e.organization_id = :orgId', { orgId })
      .andWhere('e.expiry_date <= :thirtyDays', { thirtyDays })
      .andWhere('e.status NOT IN (:...statuses)', { statuses: ['expired', 'archived'] })
      .getMany()
  }
}
