import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Application } from '../../database/entities/application.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Vendor } from '../../database/entities/vendor.entity'
import { ApplicationsController } from './applications.controller'
import { ApplicationsService } from './applications.service'

@Module({
  imports: [TypeOrmModule.forFeature([Application, RopaActivity, Vendor])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
