import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { RightsRequestNote } from '../../database/entities/rights-request-note.entity'

const CLOSED = ['completed', 'rejected', 'withdrawn']
const DEFAULT_SLA_DAYS = 30  // PDPA — respond within 30 days

// Ported from PDPA Studio getSlaStatusAttribute()
export function slaStatus(r: RightsRequest): string {
  if (CLOSED.includes(r.status)) return 'closed'
  if (!r.due_date) return 'no_sla'
  const daysLeft = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 864e5)
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= 3) return 'critical'
  if (daysLeft <= 7) return 'warning'
  return 'on_track'
}

@Injectable()
export class DsarService {
  constructor(
    @InjectRepository(RightsRequest)     private repo: Repository<RightsRequest>,
    @InjectRepository(RightsRequestNote) private noteRepo: Repository<RightsRequestNote>,
  ) {}

  async findAll(orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId }, order: { created_at: 'DESC' } })
    return rows.map(r => ({ ...r, sla_status: slaStatus(r) }))
  }

  async findOne(id: string, orgId: string) {
    const r = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!r) throw new NotFoundException(`Request ${id} not found`)
    const notes = await this.noteRepo.find({ where: { rights_request_id: id }, order: { created_at: 'DESC' } })
    return { ...r, sla_status: slaStatus(r), notes }
  }

  async create(body: Partial<RightsRequest>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const ticket = body.ticket_number || `DSAR-${year}-${String(count + 1).padStart(4, '0')}`
    const due = body.due_date || new Date(Date.now() + DEFAULT_SLA_DAYS * 864e5)
    return this.repo.save(this.repo.create({
      ...body, ticket_number: ticket, organization_id: orgId,
      status: body.status || 'pending', submitted_at: new Date(), due_date: due as any,
    }))
  }

  async updateStatus(id: string, status: string, orgId: string) {
    await this.findOne(id, orgId)
    const patch: any = { status }
    if (status === 'completed') patch.completed_at = new Date()
    if (status === 'in_review') patch.acknowledged_at = new Date()
    await this.repo.update({ id }, patch)
    return this.findOne(id, orgId)
  }

  async verifyIdentity(id: string, userId: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { identity_verified_at: new Date(), identity_verified_by: userId })
    return this.findOne(id, orgId)
  }

  async escalate(id: string, reason: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { escalated_at: new Date(), escalation_reason: reason })
    return this.findOne(id, orgId)
  }

  addNote(id: string, note: string, userName: string) {
    return this.noteRepo.save(this.noteRepo.create({ rights_request_id: id, note, created_by_name: userName }))
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    let open = 0, overdue = 0, completed = 0, critical = 0
    for (const r of all) {
      const s = slaStatus(r)
      if (!CLOSED.includes(r.status)) open++
      if (s === 'overdue') overdue++
      if (s === 'critical') critical++
      if (r.status === 'completed') completed++
    }
    const byType: Record<string, number> = {}
    for (const r of all) byType[r.type] = (byType[r.type] ?? 0) + 1
    return { total: all.length, open, overdue, critical, completed, by_type: byType }
  }
}
