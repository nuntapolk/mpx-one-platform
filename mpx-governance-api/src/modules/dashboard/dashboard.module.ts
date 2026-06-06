import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { Assessment } from '../../database/entities/assessment.entity'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'
import { Evidence } from '../../database/entities/evidence.entity'
import { Control } from '../../database/entities/control.entity'
import { Framework } from '../../database/entities/framework.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RiskRegister, Assessment, Issue, ActionPlan, Evidence, Control, Framework])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
