import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { RightsRequestNote } from '../../database/entities/rights-request-note.entity'
import { DsarController } from './dsar.controller'
import { DsarService } from './dsar.service'

@Module({
  imports: [TypeOrmModule.forFeature([RightsRequest, RightsRequestNote])],
  controllers: [DsarController],
  providers: [DsarService],
})
export class DsarModule {}
