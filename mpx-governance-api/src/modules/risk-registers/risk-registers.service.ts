import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RiskRegister } from '../../database/entities/risk-register.entity'

@Injectable()
export class RiskRegistersService {
  constructor(@InjectRepository(RiskRegister) private repo: Repository<RiskRegister>) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Risk ${id} not found`)
    return item
  }

  create(body: Partial<RiskRegister>, orgId: string) { return this.repo.save(this.repo.create({ ...body, organization_id: orgId })) }

  async update(id: string, body: Partial<RiskRegister>, orgId: string) {
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
