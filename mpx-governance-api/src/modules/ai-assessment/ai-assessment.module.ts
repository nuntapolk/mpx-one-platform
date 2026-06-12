import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiAssessment } from '../../database/entities/ai-assessment.entity'
import { AIUseCase } from '../../database/entities/ai-use-case.entity'
import { AiAssessmentController } from './ai-assessment.controller'
import { AiAssessmentService } from './ai-assessment.service'

@Module({
  imports: [TypeOrmModule.forFeature([AiAssessment, AIUseCase])],
  controllers: [AiAssessmentController],
  providers: [AiAssessmentService],
})
export class AiAssessmentModule {}
