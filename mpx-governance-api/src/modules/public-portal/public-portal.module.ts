import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organization } from '../../database/entities/organization.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { RopaCampaign } from '../../database/entities/ropa-campaign.entity'
import { RopaCampaignInvitee } from '../../database/entities/ropa-campaign-invitee.entity'
import { PublicPortalController } from './public-portal.controller'
import { PublicPortalService } from './public-portal.service'

@Module({
  imports: [TypeOrmModule.forFeature([Organization, RightsRequest, RopaActivity, RopaCampaign, RopaCampaignInvitee])],
  controllers: [PublicPortalController],
  providers: [PublicPortalService],
})
export class PublicPortalModule {}
