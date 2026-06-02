import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Obligation } from '../../database/entities/obligation.entity'

@Injectable()
export class ObligationsService {
  constructor(@InjectRepository(Obligation) private repo: Repository<Obligation>) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { clause: 'ASC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Obligation ${id} not found`)
    return item
  }

  create(body: Partial<Obligation>, orgId: string) { return this.repo.save(this.repo.create({ ...body, organization_id: orgId })) }

  async update(id: string, body: Partial<Obligation>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { status: 'inactive' })
    return { success: true }
  }
}
