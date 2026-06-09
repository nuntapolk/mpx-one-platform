import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'

// ── ROPA completeness (4 phases / sections) ────────────────────
const SECTIONS: { key: string; label: string; fields: (keyof RopaActivity)[] }[] = [
  { key: 'basic',      label: 'ข้อมูลพื้นฐาน', fields: ['processing_activity_name', 'purpose', 'lawful_basis', 'data_subject_type'] },
  { key: 'collection', label: 'การเก็บรวบรวม', fields: ['personal_data_category', 'collection_formats', 'privacy_notice_given'] },
  { key: 'storage',    label: 'จัดเก็บ & เข้าถึง', fields: ['storage_formats', 'authorized_access_roles', 'encryption_enabled', 'retention_period'] },
  { key: 'security',   label: 'มาตรการความปลอดภัย', fields: ['technical_measures', 'organizational_measures'] },
  { key: 'dpia',       label: 'DPIA & Risk', fields: ['dpia_status', 'risk_level'] },
]

function hasValue(v: any): boolean {
  if (v === null || v === undefined || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  if (v === false) return false
  return true
}

export function ropaCompleteness(r: RopaActivity) {
  const sections = SECTIONS.map(s => {
    const filled = s.fields.filter(f => hasValue((r as any)[f])).length
    return { key: s.key, label: s.label, filled, total: s.fields.length, pct: Math.round((filled / s.fields.length) * 100) }
  })
  const totalFields = SECTIONS.reduce((n, s) => n + s.fields.length, 0)
  const filledFields = sections.reduce((n, s) => n + s.filled, 0)
  return { overall_pct: Math.round((filledFields / totalFields) * 100), sections }
}

@Injectable()
export class RopaService {
  constructor(@InjectRepository(RopaActivity) private repo: Repository<RopaActivity>) {}

  async findAll(orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
    return rows.map(r => ({ ...r, completeness: ropaCompleteness(r).overall_pct }))
  }

  async findOne(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('RopaActivity ' + id + ' not found')
    return { ...item, completeness: ropaCompleteness(item) }
  }

  async create(body: Partial<RopaActivity>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const code = body.ropa_code || 'ROPA-' + year + '-' + String(count + 1).padStart(3, '0')
    return this.repo.save(this.repo.create({ ...body, ropa_code: code, organization_id: orgId }))
  }

  async update(id: string, body: Partial<RopaActivity>, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('RopaActivity ' + id + ' not found')
    await this.repo.update({ id, organization_id: orgId }, body as any)
    return this.findOne(id, orgId)
  }

  async remove(id: string, orgId: string) {
    const item = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!item) throw new NotFoundException('RopaActivity ' + id + ' not found')
    await this.repo.update({ id, organization_id: orgId }, { status: 'inactive' })
    return { success: true }
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    const total = all.length
    const noOwner = all.filter((a: any) => !a.process_owner_id).length
    const dpiaRequired = all.filter(a => a.dpia_required_flag).length
    const crossBorder = all.filter(a => a.cross_border_transfer_flag).length
    const avgCompleteness = total > 0
      ? Math.round(all.reduce((n, r) => n + ropaCompleteness(r).overall_pct, 0) / total)
      : 0
    const incomplete = all.filter(r => ropaCompleteness(r).overall_pct < 80).length
    return { total, no_owner: noOwner, dpia_required: dpiaRequired, cross_border: crossBorder, avg_completeness: avgCompleteness, incomplete }
  }
}
