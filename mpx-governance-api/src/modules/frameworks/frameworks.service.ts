import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Framework } from '../../database/entities/framework.entity'
import { Obligation } from '../../database/entities/obligation.entity'

@Injectable()
export class FrameworksService {
  constructor(
    @InjectRepository(Framework) private fwRepo: Repository<Framework>,
    @InjectRepository(Obligation) private oblRepo: Repository<Obligation>,
  ) {}

  findAll(orgId: string) {
    return this.fwRepo.find({ where: { organization_id: orgId }, order: { name: 'ASC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.fwRepo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Framework ${id} not found`)
    return item
  }

  create(body: Partial<Framework>, orgId: string) {
    return this.fwRepo.save(this.fwRepo.create({ ...body, organization_id: orgId }))
  }

  async update(id: string, body: Partial<Framework>, orgId: string) {
    await this.findOne(id, orgId)
    await this.fwRepo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.fwRepo.update({ id, organization_id: orgId }, { status: 'inactive' })
    return { success: true }
  }

  // Obligations under a framework
  getObligations(frameworkId: string, orgId: string) {
    return this.oblRepo.find({
      where: { framework_id: frameworkId, organization_id: orgId },
      order: { clause: 'ASC' },
    })
  }
}
