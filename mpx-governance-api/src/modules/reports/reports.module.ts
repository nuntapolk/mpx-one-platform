import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { Dpia } from '../../database/entities/dpia.entity'
import { RightsRequest } from '../../database/entities/rights-request.entity'
import { BreachIncident } from '../../database/entities/breach-incident.entity'
import { Consent } from '../../database/entities/consent.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { TrainingCourse } from '../../database/entities/training-course.entity'
import { TrainingCompletion } from '../../database/entities/training-completion.entity'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'

@Module({
  imports: [TypeOrmModule.forFeature([RopaActivity, Dpia, RightsRequest, BreachIncident, Consent, RiskRegister, TrainingCourse, TrainingCompletion])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
