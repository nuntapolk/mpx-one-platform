import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BreachIncident } from '../../database/entities/breach-incident.entity'
import { BreachTimeline } from '../../database/entities/breach-timeline.entity'

const OPEN = ['reported', 'investigating', 'contained', 'notified']

// PDPA: notify PDPC within 72 hours of becoming aware
export function pdpcStatus(b: BreachIncident): { state: string; hours_left: number | null } {
  if (b.pdpc_notified_at) return { state: 'notified', hours_left: null }
  if (!b.requires_pdpc_notification) return { state: 'not_required', hours_left: null }
  if (!b.pdpc_notification_deadline) return { state: 'pending', hours_left: null }
  const hoursLeft = Math.floor((new Date(b.pdpc_notification_deadline).getTime() - Date.now()) / 36e5)
  if (hoursLeft < 0) return { state: 'overdue', hours_left: hoursLeft }
  if (hoursLeft <= 12) return { state: 'critical', hours_left: hoursLeft }
  return { state: 'on_track', hours_left: hoursLeft }
}

@Injectable()
export class BreachService {
  constructor(
    @InjectRepository(BreachIncident) private repo: Repository<BreachIncident>,
    @InjectRepository(BreachTimeline) private tlRepo: Repository<BreachTimeline>,
  ) {}

  async findAll(orgId: string) {
    const rows = await this.repo.find({ where: { organization_id: orgId }, order: { discovered_at: 'DESC' } })
    return rows.map(b => ({ ...b, pdpc: pdpcStatus(b) }))
  }

  async findOne(id: string, orgId: string) {
    const b = await this.repo.findOne({ where: { id, organization_id: orgId } })
    if (!b) throw new NotFoundException(`Breach ${id} not found`)
    const timeline = await this.tlRepo.find({ where: { breach_incident_id: id }, order: { created_at: 'DESC' } })
    return { ...b, pdpc: pdpcStatus(b), timeline }
  }

  async create(body: Partial<BreachIncident>, orgId: string) {
    const count = await this.repo.count({ where: { organization_id: orgId } })
    const year = new Date().getFullYear()
    const num = body.incident_number || `BR-${year}-${String(count + 1).padStart(4, '0')}`
    const discovered = body.discovered_at ? new Date(body.discovered_at) : new Date()
    // 72-hour deadline auto-set from discovery if PDPC notification required
    const deadline = body.requires_pdpc_notification
      ? new Date(discovered.getTime() + 72 * 36e5)
      : undefined
    const saved = await this.repo.save(this.repo.create({
      ...body, incident_number: num, organization_id: orgId,
      discovered_at: discovered, status: body.status || 'reported',
      pdpc_notification_deadline: deadline as any,
    }))
    await this.addTimeline(saved.id, 'created', 'รายงานเหตุละเมิดข้อมูล', 'system')
    return saved
  }

  async updateStatus(id: string, status: string, orgId: string) {
    await this.findOne(id, orgId)
    const patch: any = { status }
    if (status === 'resolved') patch.resolved_at = new Date()
    await this.repo.update({ id }, patch)
    await this.addTimeline(id, 'status_change', `เปลี่ยนสถานะเป็น ${status}`, 'system')
    return this.findOne(id, orgId)
  }

  async notifyPdpc(id: string, reference: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { pdpc_notified_at: new Date(), pdpc_reference_number: reference, status: 'notified' })
    await this.addTimeline(id, 'pdpc_notified', `แจ้ง PDPC แล้ว (อ้างอิง ${reference})`, 'system')
    return this.findOne(id, orgId)
  }

  async notifySubjects(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.repo.update({ id }, { subjects_notified_at: new Date() })
    await this.addTimeline(id, 'subjects_notified', 'แจ้งเจ้าของข้อมูลแล้ว', 'system')
    return this.findOne(id, orgId)
  }

  addTimeline(breachId: string, action: string, description: string, userName: string) {
    return this.tlRepo.save(this.tlRepo.create({ breach_incident_id: breachId, action, description, user_name: userName }))
  }

  async getStats(orgId: string) {
    const all = await this.repo.find({ where: { organization_id: orgId } })
    let open = 0, pdpcOverdue = 0, pdpcCritical = 0, awaitingNotify = 0
    for (const b of all) {
      if (OPEN.includes(b.status)) open++
      const p = pdpcStatus(b)
      if (p.state === 'overdue') pdpcOverdue++
      if (p.state === 'critical') pdpcCritical++
      if (p.state === 'pending' || p.state === 'on_track' || p.state === 'critical') awaitingNotify++
    }
    const bySeverity: Record<string, number> = {}
    for (const b of all) bySeverity[b.severity] = (bySeverity[b.severity] ?? 0) + 1
    return { total: all.length, open, pdpc_overdue: pdpcOverdue, pdpc_critical: pdpcCritical, awaiting_notify: awaitingNotify, by_severity: bySeverity }
  }
}
