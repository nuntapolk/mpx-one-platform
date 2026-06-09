import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingCourse } from '../../database/entities/training-course.entity'
import { TrainingController } from './training.controller'
import { TrainingService } from './training.service'

@Module({
  imports: [TypeOrmModule.forFeature([TrainingCourse])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
