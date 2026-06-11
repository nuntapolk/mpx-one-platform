import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AppUser } from '../../database/entities/app-user.entity'

export const APP_ROLES = ['admin', 'dpo', 'it-admin', 'viewer']

@Injectable()
export class AccountsService {
  constructor(@InjectRepository(AppUser) private repo: Repository<AppUser>) {}

  findAll(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
  }

  async findOne(id: string, orgId: string) {
    const u = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!u) throw new NotFoundException('User ' + id + ' not found')
    return u
  }

  async create(body: any, orgId: string) {
    const email = String(body?.email || '').trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestException('อีเมลไม่ถูกต้อง')
    if (await this.repo.findOne({ where: { email } })) throw new BadRequestException('อีเมลนี้มีอยู่แล้ว')
    const roles = this.sanitizeRoles(body?.roles)
    return this.repo.save(this.repo.create({
      organization_id: orgId, email, name: body?.name ?? null,
      roles, is_active: body?.is_active ?? true,
    } as any))
  }

  async update(id: string, body: any, orgId: string) {
    await this.findOne(id, orgId)
    const patch: any = {}
    if (body?.name !== undefined) patch.name = body.name
    if (body?.roles !== undefined) patch.roles = this.sanitizeRoles(body.roles)
    if (body?.is_active !== undefined) patch.is_active = !!body.is_active
    await this.repo.update({ id, organization_id: orgId }, patch)
    return this.findOne(id, orgId)
  }

  // Soft-disable rather than hard delete (keeps audit/log linkage intact).
  async deactivate(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id, organization_id: orgId }, { is_active: false })
    return { success: true }
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const byRole: Record<string, number> = {}
    for (const u of all) for (const r of u.roles || []) byRole[r] = (byRole[r] ?? 0) + 1
    return {
      total: all.length,
      active: all.filter(u => u.is_active).length,
      inactive: all.filter(u => !u.is_active).length,
      by_role: byRole,
    }
  }

  private sanitizeRoles(roles: any): string[] {
    if (!Array.isArray(roles)) return ['viewer']
    const clean = roles.filter((r: string) => APP_ROLES.includes(r))
    return clean.length ? clean : ['viewer']
  }
}
