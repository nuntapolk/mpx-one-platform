import { Injectable, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AppContent } from '../../database/entities/app-content.entity'

@Injectable()
export class AppContentService {
  constructor(@InjectRepository(AppContent) private readonly repo: Repository<AppContent>) {}

  async get(org: string, key: string) {
    const row = await this.repo.findOne({ where: { organization_id: org, key } })
    return { key, value: row?.value ?? null, updated_at: row?.updated_at ?? null, updated_by: row?.updated_by ?? null }
  }

  // Admin-only write — enforced via the user's roles.
  async set(org: string, key: string, value: any, user: any) {
    const roles: string[] = user?.roles ?? []
    if (!roles.includes('admin')) throw new ForbiddenException('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่แก้ไขได้')
    let row = await this.repo.findOne({ where: { organization_id: org, key } })
    if (!row) row = this.repo.create({ organization_id: org, key })
    row.value = value
    row.updated_by = user?.name || user?.email || 'admin'
    await this.repo.save(row)
    return { key, value: row.value, updated_at: row.updated_at, updated_by: row.updated_by }
  }
}
