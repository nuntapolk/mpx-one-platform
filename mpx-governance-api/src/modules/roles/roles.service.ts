import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from '../../database/entities/role.entity'

export const SYSTEM_ROLES = ['admin', 'dpo', 'viewer']
const ACCESS = ['none', 'view', 'add', 'full']

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}

  async findAll(orgId: string) {
    await this.ensureDefaults(orgId)
    return this.repo.find({ where: { organization_id: orgId }, order: { is_system: 'DESC', label: 'ASC' } })
  }

  // Idempotently create the 3 non-deletable system roles for an org.
  async ensureDefaults(orgId: string) {
    const defaults: Partial<Role>[] = [
      { key: 'admin', label: 'Administrator', is_system: true, description: 'สิทธิ์เต็มทุกเมนู', permissions: { '*': 'full' } },
      { key: 'dpo', label: 'DPO', is_system: true, description: 'เจ้าหน้าที่คุ้มครองข้อมูล', permissions: { '*': 'view' } },
      { key: 'viewer', label: 'Viewer', is_system: true, description: 'ดูอย่างเดียว', permissions: { '*': 'view' } },
    ]
    for (const d of defaults) {
      const exists = await this.repo.findOne({ where: { organization_id: orgId, key: d.key } })
      if (!exists) await this.repo.save(this.repo.create({ ...d, organization_id: orgId } as any))
    }
  }

  async create(body: any, orgId: string) {
    const key = String(body?.key || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    if (!key) throw new BadRequestException('กรุณาระบุ key ของ role')
    if (SYSTEM_ROLES.includes(key)) throw new BadRequestException('key นี้สงวนไว้สำหรับ role ระบบ')
    if (await this.repo.findOne({ where: { organization_id: orgId, key } })) throw new BadRequestException('role key นี้มีอยู่แล้ว')
    return this.repo.save(this.repo.create({
      organization_id: orgId, key, label: body?.label || key,
      description: body?.description ?? null, is_system: false,
      permissions: this.sanitize(body?.permissions),
    } as any))
  }

  async update(id: string, body: any, orgId: string) {
    const role = await this.findOne(id, orgId)
    const patch: any = {}
    if (body?.label !== undefined) patch.label = body.label
    if (body?.description !== undefined) patch.description = body.description
    if (body?.permissions !== undefined) patch.permissions = this.sanitize(body.permissions)
    // System roles: permissions editable, but key/identity locked.
    await this.repo.update({ id, organization_id: orgId }, patch)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    const role = await this.findOne(id, orgId)
    if (role.is_system) throw new ForbiddenException('ลบ role ระบบไม่ได้ (admin/dpo/viewer)')
    await this.repo.delete({ id, organization_id: orgId })
    return { success: true }
  }

  async findOne(id: string, orgId: string) {
    const r = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!r) throw new NotFoundException('Role ' + id + ' not found')
    return r
  }

  private sanitize(perms: any): Record<string, string> {
    if (!perms || typeof perms !== 'object') return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(perms)) if (ACCESS.includes(v as string)) out[k] = v as string
    return out
  }
}
