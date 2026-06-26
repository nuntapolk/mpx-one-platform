import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScoreSnapshot } from '../../database/entities/score-snapshot.entity'
import { ScoreComponent } from '../../database/entities/score-component.entity'
import { ModuleScore } from '../../database/entities/module-score.entity'
import { UnitScore } from '../../database/entities/unit-score.entity'
import { ScoreMethodologyVersion } from '../../database/entities/score-methodology-version.entity'
import { BusinessUnit } from '../../database/entities/business-unit.entity'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'
import { ReadinessController } from './readiness.controller'
import { ReadinessService } from './readiness.service'
import { ScoringService } from './scoring.service'

@Module({
  imports: [TypeOrmModule.forFeature([
    ScoreSnapshot, ScoreComponent, ModuleScore, UnitScore, ScoreMethodologyVersion,
    BusinessUnit, Issue, ActionPlan,
  ])],
  controllers: [ReadinessController],
  providers: [ReadinessService, ScoringService],
})
export class ReadinessModule {}
