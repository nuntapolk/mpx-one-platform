import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExternalParty } from '../../database/entities/external-party.entity'
import { DataProcessingAgreement } from '../../database/entities/dpa.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Dpia } from '../../database/entities/dpia.entity'
import { DataMapController } from './data-map.controller'
import { DataMapService } from './data-map.service'

@Module({
  imports: [TypeOrmModule.forFeature([ExternalParty, DataProcessingAgreement, RopaActivity, Dpia])],
  controllers: [DataMapController],
  providers: [DataMapService],
})
export class DataMapModule {}
