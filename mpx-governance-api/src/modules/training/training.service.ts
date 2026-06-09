import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrainingCourse } from '../../database/entities/training-course.entity'

@Injectable()
export class TrainingService {
  constructor(@InjectRepository(TrainingCourse) private repo: Repository<TrainingCourse>) {}

  findAll(orgId: string) { return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } }) }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('TrainingCourse ' + id + ' not found')
    return item
  }

  async create(body: any, orgId: string) {
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

  async getStats(orgId: string) {
    const all: any[] = await this.repo.find({ where: { organization_id: orgId } })
    const byStatus: Record<string, number> = {}
    for (const a of all) { const s = a.status || 'n/a'; byStatus[s] = (byStatus[s] ?? 0) + 1 }
    return { total: all.length, by_status: byStatus }
  }
}
