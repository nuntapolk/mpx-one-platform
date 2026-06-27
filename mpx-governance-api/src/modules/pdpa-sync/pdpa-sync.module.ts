import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { Consent } from '../../database/entities/consent.entity'
import { PdpaStudioClient } from './pdpa-studio.client'
import { PdpaSyncService } from './pdpa-sync.service'
import { PdpaSyncController } from './pdpa-sync.controller'

@Module({
  imports: [TypeOrmModule.forFeature([RopaActivity, RightsRequest, Consent])],
  controllers: [PdpaSyncController],
  providers: [PdpaStudioClient, PdpaSyncService],
})
export class PdpaSyncModule {}
