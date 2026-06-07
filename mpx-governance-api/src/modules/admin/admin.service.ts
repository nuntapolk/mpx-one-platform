import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Lookup } from '../../database/entities/lookup.entity'

@Injectable()
export class AdminService {
  constructor(@InjectRepository(Lookup) private repo: Repository<Lookup>) {}

  findAll(orgId: string, category?: string) {
    const where: any = { organization_id: orgId }
    if (category) where.category = category
    return this.repo.find({ where, order: { category: 'ASC', display_order: 'ASC' } })
  }

  async categories(orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId }, select: ['category'] })
    const counts: Record<string, number> = {}
    for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1
    return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => a.category.localeCompare(b.category))
  }

  create(body: Partial<Lookup>, orgId: string) {
    return this.repo.save(this.repo.create({ ...body, organization_id: orgId }))
  }

  async update(id: string, body: Partial<Lookup>, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException(`Lookup ${id} not found`)
    await this.repo.update({ id }, body)
    return this.repo.findOne({ where: { id } })
  }

  // Soft-deactivate (spec: ที่ถูกใช้แล้วไม่ควรลบจริง)
  async deactivate(id: string, orgId: string) {
    await this.repo.update({ id, organization_id: orgId }, { is_active: false })
    return { success: true }
  }
}
