import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkflowTemplate } from '../../database/entities/workflow-template.entity'
import { WorkflowInstance } from '../../database/entities/workflow-instance.entity'
import { WorkflowController } from './workflow.controller'
import { WorkflowService } from './workflow.service'

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplate, WorkflowInstance])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}
