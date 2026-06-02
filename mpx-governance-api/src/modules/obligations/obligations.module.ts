import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Obligation } from '../../database/entities/obligation.entity'
import { ObligationsController } from './obligations.controller'
import { ObligationsService } from './obligations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Obligation])],
  controllers: [ObligationsController],
  providers: [ObligationsService],
  exports: [ObligationsService],
})
export class ObligationsModule {}
