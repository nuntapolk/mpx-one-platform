import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ITAsset } from '../../database/entities/it-asset.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { AITool } from '../../database/entities/ai-tool.entity'
import { DataAsset } from '../../database/entities/data-asset.entity'
import { ChangeRequest } from '../../database/entities/change-request.entity'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ITAsset) private itAssets: Repository<ITAsset>,
    @InjectRepository(RiskRegister) private risks: Repository<RiskRegister>,
    @InjectRepository(AITool) private aiTools: Repository<AITool>,
    @InjectRepository(DataAsset) private dataAssets: Repository<DataAsset>,
    @InjectRepository(ChangeRequest) private changeRequests: Repository<ChangeRequest>,
  ) {}

  async getSummary(orgId: string) {
    const [itTotal, riskOpen, aiPending, crPending] = await Promise.all([
      this.itAssets.count({ where: { organization_id: orgId, status: 'active' } }),
      this.risks.count({ where: { organization_id: orgId, status: 'open' } }),
      this.aiTools.count({ where: { organization_id: orgId, status: 'pending' } }),
      this.changeRequests.count({ where: { organization_id: orgId, status: 'pending' } }),
    ])

    const highRisks = await this.risks
      .createQueryBuilder('r')
      .where('r.organization_id = :orgId', { orgId })
      .andWhere("r.status = 'open'")
      .andWhere("r.inherent_score >= 12")
      .getCount()

    return {
      it_assets: { total: itTotal },
      risks: { open: riskOpen, high_severity: highRisks },
      ai_tools: { pending_review: aiPending },
      change_requests: { pending: crPending },
    }
  }
}
