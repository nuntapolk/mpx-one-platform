import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Vendor } from '../../database/entities/vendor.entity'

@Injectable()
export class VendorsService {
  constructor(@InjectRepository(Vendor) private repo: Repository<Vendor>) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('Vendor ' + id + ' not found')
    return item
  }

  async create(body: Partial<Vendor>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const code = body.vendor_code || 'VND-' + year + '-' + String(count + 1).padStart(3, '0')
    return this.repo.save(this.repo.create({ ...body, vendor_code: code, organization_id: orgId }))
  }

  async update(id: string, body: Partial<Vendor>, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, body)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { status: 'inactive' })
    return { success: true }
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const total = all.length
    const noOwner = all.filter((a: any) =>
      !a.business_owner_id && !a.data_owner_id && !a.process_owner_id &&
      !a.ai_owner_id && !a.project_manager_id && !a.contract_owner_id).length
    return { total, no_owner: noOwner }
  }
}
