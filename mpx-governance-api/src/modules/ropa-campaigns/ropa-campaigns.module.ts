import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RopaCampaign } from '../../database/entities/ropa-campaign.entity'
import { RopaCampaignsController } from './ropa-campaigns.controller'
import { RopaCampaignsService } from './ropa-campaigns.service'

@Module({
  imports: [TypeOrmModule.forFeature([RopaCampaign])],
  controllers: [RopaCampaignsController],
  providers: [RopaCampaignsService],
  exports: [RopaCampaignsService],
})
export class RopaCampaignsModule {}
