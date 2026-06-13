import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiAssessment } from '../../database/entities/ai-assessment.entity'
import { AIUseCase } from '../../database/entities/ai-use-case.entity'
import { Vendor } from '../../database/entities/vendor.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { TrainingCourse } from '../../database/entities/training-course.entity'
import { AiAssessmentController } from './ai-assessment.controller'
import { AiAssessmentService } from './ai-assessment.service'

@Module({
  imports: [TypeOrmModule.forFeature([AiAssessment, AIUseCase, Vendor, RiskRegister, TrainingCourse])],
  controllers: [AiAssessmentController],
  providers: [AiAssessmentService],
})
export class AiAssessmentModule {}
