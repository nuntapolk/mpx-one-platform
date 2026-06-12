import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EaCapability } from '../../database/entities/ea-capability.entity'
import { EaCapabilityMap } from '../../database/entities/ea-capability-map.entity'
import { Application } from '../../database/entities/application.entity'
import { EaCapabilitiesController } from './ea-capabilities.controller'
import { EaCapabilitiesService } from './ea-capabilities.service'

@Module({
  imports: [TypeOrmModule.forFeature([EaCapability, EaCapabilityMap, Application])],
  controllers: [EaCapabilitiesController],
  providers: [EaCapabilitiesService],
})
export class EaCapabilitiesModule {}
