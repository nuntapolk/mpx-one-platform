import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organization } from '../../database/entities/organization.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { RopaCampaign } from '../../database/entities/ropa-campaign.entity'
import { RopaCampaignInvitee } from '../../database/entities/ropa-campaign-invitee.entity'

const DSAR_TYPES = ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'withdraw_consent']

@Injectable()
export class PublicPortalService {
  constructor(
    @InjectRepository(Organization) private orgs: Repository<Organization>,
    @InjectRepository(RightsRequest) private rights: Repository<RightsRequest>,
    @InjectRepository(RopaActivity) private ropa: Repository<RopaActivity>,
    @InjectRepository(RopaCampaign) private campaigns: Repository<RopaCampaign>,
    @InjectRepository(RopaCampaignInvitee) private invitees: Repository<RopaCampaignInvitee>,
  ) {}

  // ── Rights (DSAR) portal ──────────────────────────────────────
  async getOrgBySlug(slug: string) {
    const org = await this.orgs.findOne({ where: { slug } })
    if (!org) throw new NotFoundException('ไม่พบองค์กร')
    return { name: org.name, slug: org.slug }
  }

  async submitRights(slug: string, body: any) {
    // Honeypot — bots fill hidden field
    if (body?._hp_name) return { ok: true, ticket_number: 'OK' }

    const org = await this.orgs.findOne({ where: { slug } })
    if (!org) throw new NotFoundException('ไม่พบองค์กร')

    const name = String(body?.requester_name || '').trim()
    const email = String(body?.requester_email || '').trim()
    const type = String(body?.request_type || '').trim()
    const description = String(body?.description || '').trim()
    if (!name || !email) throw new BadRequestException('กรุณากรอกชื่อและอีเมล')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestException('อีเมลไม่ถูกต้อง')
    if (!DSAR_TYPES.includes(type)) throw new BadRequestException('ประเภทคำขอไม่ถูกต้อง')
    if (!description) throw new BadRequestException('กรุณาระบุรายละเอียดคำขอ')

    const year = new Date().getFullYear()
    const count = await this.rights.count({ where: { organization_id: org.id } })
    const ticket = `DSR-${year}-${String(count + 1).padStart(4, '0')}`

    const due = new Date(); due.setDate(due.getDate() + 30) // PDPA 30-day SLA

    const saved: any = await this.rights.save(this.rights.create({
      organization_id: org.id,
      ticket_number: ticket,
      type, status: 'pending',
      requester_name: name,
      requester_email: email,
      requester_phone: String(body?.requester_phone || '').trim() || null,
      description,
      submitted_at: new Date(),
      due_date: due,
    } as any))
    return { ok: true, ticket_number: saved.ticket_number }
  }

  // ── ROPA Campaign portal ──────────────────────────────────────
  async getCampaign(token: string) {
    const c = await this.campaigns.findOne({ where: { campaign_token: token } })
    if (!c) throw new NotFoundException('ไม่พบแคมเปญ หรือลิงก์ไม่ถูกต้อง')
    if (c.status !== 'active') throw new BadRequestException('แคมเปญนี้ปิดรับข้อมูลแล้ว')
    if (c.deadline && new Date(c.deadline).getTime() < Date.now() - 864e5) throw new BadRequestException('แคมเปญนี้หมดเขตแล้ว')
    return {
      name: c.name, description: c.description, deadline: c.deadline,
      require_employee_id: c.require_employee_id, mode: c.mode,
    }
  }

  async submitCampaign(token: string, body: any) {
    const c = await this.campaigns.findOne({ where: { campaign_token: token } })
    if (!c) throw new NotFoundException('ไม่พบแคมเปญ')
    if (c.status !== 'active') throw new BadRequestException('แคมเปญนี้ปิดรับข้อมูลแล้ว')

    const name = String(body?.respondent_name || '').trim()
    const email = String(body?.respondent_email || '').trim()
    const activity = String(body?.processing_activity_name || '').trim()
    if (!name || !email) throw new BadRequestException('กรุณากรอกชื่อและอีเมลผู้กรอก')
    if (c.require_employee_id && !String(body?.employee_id || '').trim()) throw new BadRequestException('กรุณากรอกรหัสพนักงาน')
    if (!activity) throw new BadRequestException('กรุณาระบุชื่อกิจกรรมการประมวลผล')

    // Generate ROPA code
    const count = await this.ropa.count({ where: { organization_id: c.organization_id } })
    const code = `ROPA-C${String(count + 1).padStart(4, '0')}`

    const saved: any = await this.ropa.save(this.ropa.create({
      organization_id: c.organization_id,
      ropa_code: code,
      processing_activity_name: activity,
      description: String(body?.description || '').trim() || null,
      department: String(body?.department || '').trim() || null,
      purpose: String(body?.purpose || '').trim() || null,
      lawful_basis: String(body?.lawful_basis || '').trim() || null,
      data_subject_type: String(body?.data_subject_type || '').trim() || null,
      personal_data_category: String(body?.personal_data_category || '').trim() || null,
      recipient: String(body?.recipient || '').trim() || null,
      retention_period: String(body?.retention_period || '').trim() || null,
      status: 'draft',
      target_pass: 1,
      pass1_complete: false,
    } as any))

    // Record the invitee submission
    await this.invitees.save(this.invitees.create({
      campaign_id: c.id, name, email,
      employee_id: String(body?.employee_id || '').trim() || null,
      department: String(body?.department || '').trim() || null,
      status: 'submitted', submitted_at: new Date(),
    } as any))

    return { ok: true, ropa_code: saved.ropa_code }
  }
}
