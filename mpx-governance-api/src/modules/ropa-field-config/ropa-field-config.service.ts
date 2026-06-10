import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RopaFieldConfig } from '../../database/entities/ropa-field-config.entity'

@Injectable()
export class RopaFieldConfigService {
  constructor(@InjectRepository(RopaFieldConfig) private repo: Repository<RopaFieldConfig>) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { section: 'ASC', sort_order: 'ASC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('RopaFieldConfig ' + id + ' not found')
    return item
  }

  create(body: any, orgId: string) {
    return this.repo.save(this.repo.create({ ...body, organization_id: orgId }))
  }

  async update(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.delete({ id, organization_id: orgId })
    return { success: true }
  }
}
