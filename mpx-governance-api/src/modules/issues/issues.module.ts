import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Issue } from '../../database/entities/issue.entity'
import { ActionPlan } from '../../database/entities/action-plan.entity'
import { IssuesController } from './issues.controller'
import { IssuesService } from './issues.service'

@Module({
  imports: [TypeOrmModule.forFeature([Issue, ActionPlan])],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
