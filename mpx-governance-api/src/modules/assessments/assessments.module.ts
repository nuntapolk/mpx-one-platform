import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssessmentTemplate } from '../../database/entities/assessment-template.entity'
import { AssessmentTemplateControl } from '../../database/entities/assessment-template-control.entity'
import { Assessment } from '../../database/entities/assessment.entity'
import { AssessmentResponse } from '../../database/entities/assessment-response.entity'
import { AssessmentsController } from './assessments.controller'
import { AssessmentsService } from './assessments.service'

@Module({
  imports: [TypeOrmModule.forFeature([AssessmentTemplate, AssessmentTemplateControl, Assessment, AssessmentResponse])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
