import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Control } from '../../database/entities/control.entity'
import { ControlMapping } from '../../database/entities/control-mapping.entity'

@Injectable()
export class ControlsService {
  constructor(
    @InjectRepository(Control) private repo: Repository<Control>,
    @InjectRepository(ControlMapping) private mappingRepo: Repository<ControlMapping>,
  ) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { control_id: 'ASC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Control ${id} not found`)
    return item
  }

  create(body: Partial<Control>, orgId: string) { return this.repo.save(this.repo.create({ ...body, organization_id: orgId })) }

  async update(id: string, body: Partial<Control>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { status: 'deprecated' })
    return { success: true }
  }

  // Mappings for this control
  getMappings(controlId: string, orgId: string) {
    return this.mappingRepo.find({ where: { control_id: controlId, organization_id: orgId } })
  }

  createMapping(body: Partial<ControlMapping>, orgId: string) {
    return this.mappingRepo.save(this.mappingRepo.create({ ...body, organization_id: orgId }))
  }

  async removeMapping(mappingId: string, orgId: string) {
    await this.mappingRepo.delete({ id: mappingId, organization_id: orgId })
    return { success: true }
  }
}
