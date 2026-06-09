import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExternalParty } from '../../database/entities/external-party.entity'
import { DataProcessingAgreement } from '../../database/entities/dpa.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Dpia } from '../../database/entities/dpia.entity'

const NEEDS_DPA = ['processor', 'controller', 'joint_controller', 'data_processor', 'data_controller']

@Injectable()
export class DataMapService {
  constructor(
    @InjectRepository(ExternalParty) private readonly parties: Repository<ExternalParty>,
    @InjectRepository(DataProcessingAgreement) private readonly dpas: Repository<DataProcessingAgreement>,
    @InjectRepository(RopaActivity) private readonly ropa: Repository<RopaActivity>,
    @InjectRepository(Dpia) private readonly dpia: Repository<Dpia>,
  ) {}

  // Derive a DPA status per external party from its agreements
  private dpaStatusFor(partyId: string, dpaList: DataProcessingAgreement[]): string {
    const mine = dpaList.filter(d => d.external_party_id === partyId)
    if (mine.length === 0) return 'none'
    const now = Date.now()
    const soon = now + 60 * 864e5 // 60 days
    let best = 'none'
    for (const d of mine) {
      if (d.status === 'active') {
        if (d.expires_at && new Date(d.expires_at).getTime() < now) { best = best === 'active' ? best : 'expired'; continue }
        if (d.expires_at && new Date(d.expires_at).getTime() < soon) { if (best !== 'active') best = 'expiring'; continue }
        best = 'active'
      } else if (d.status === 'expired' && best === 'none') best = 'expired'
      else if (best === 'none') best = 'pending'
    }
    return best
  }

  async getMap(orgId: string) {
    const [partyRows, dpaRows, ropaRows, dpiaRows] = await Promise.all([
      this.parties.find({ where: { organization_id: orgId } }),
      this.dpas.find({ where: { organization_id: orgId } }),
      this.ropa.find({ where: { organization_id: orgId }, order: { ropa_code: 'ASC' } }),
      this.dpia.find({ where: { organization_id: orgId } }),
    ])

    const flows = partyRows
      .filter(p => p.status !== 'terminated')
      .map(p => {
        const type = p.relationship_type || p.type || 'third_party'
        const dpa_status = this.dpaStatusFor(p.id, dpaRows)
        const countries = (p.transfer_countries || '').split(',').map(s => s.trim()).filter(Boolean)
        return {
          id: p.id, name: p.name, code: p.code, type,
          risk: p.risk_level, cross: p.is_cross_border, countries,
          data_types: p.data_types_shared || [], dpa_status,
          country: p.country, status: p.status,
        }
      })

    const stats = {
      total_parties: flows.length,
      with_active_dpa: flows.filter(f => f.dpa_status === 'active').length,
      cross_border: flows.filter(f => f.cross).length,
      high_risk: flows.filter(f => ['high', 'critical'].includes(f.risk)).length,
      no_dpa: flows.filter(f => NEEDS_DPA.includes(f.type) && f.dpa_status === 'none').length,
    }

    // group counts by relationship type
    const grouped: Record<string, number> = {}
    for (const f of flows) grouped[f.type] = (grouped[f.type] || 0) + 1

    // ROPA-based data flows (org → recipient)
    const ropaFlows = ropaRows.map(r => ({
      id: r.id,
      ropa_code: r.ropa_code,
      process_name: r.processing_activity_name,
      department: r.department,
      data_subject_type: r.data_subject_type,
      data_category: r.personal_data_category,
      recipient: r.recipient || '',
      third_party_transfer: r.third_party_transfer,
      cross_border: r.cross_border_transfer_flag,
      countries: (r.cross_border_countries || '').split(',').map(s => s.trim()).filter(Boolean),
      risk: r.risk_level,
    }))

    // Relationships: ROPA ↔ DPIA ↔ recipient
    const dpiaByRopa = new Map<string, Dpia>()
    for (const d of dpiaRows) if (d.ropa_record_id) dpiaByRopa.set(d.ropa_record_id, d)

    const relationships = ropaRows.map(r => {
      const d = dpiaByRopa.get(r.id)
      return {
        id: r.id,
        ropa_code: r.ropa_code,
        process_name: r.processing_activity_name,
        status: r.status,
        risk: r.risk_level,
        dpia_required: r.dpia_required,
        dpia: d ? { id: d.id, dpia_number: d.dpia_number, status: d.status, risk_level: d.risk_level, residual: d.residual_risk_level } : null,
        recipient: r.recipient || '',
        cross_border: r.cross_border_transfer_flag,
      }
    })

    return { stats, grouped, flows, ropaFlows, relationships }
  }
}
