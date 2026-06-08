import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BreachIncident } from '../../database/entities/breach-incident.entity'
import { BreachTimeline } from '../../database/entities/breach-timeline.entity'
import { BreachController } from './breach.controller'
import { BreachService } from './breach.service'

@Module({
  imports: [TypeOrmModule.forFeature([BreachIncident, BreachTimeline])],
  controllers: [BreachController],
  providers: [BreachService],
})
export class BreachModule {}
