import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AIUseCase } from '../../database/entities/ai-use-case.entity'
import { AiUseCasesController } from './ai-use-cases.controller'
import { AiUseCasesService } from './ai-use-cases.service'

@Module({
  imports: [TypeOrmModule.forFeature([AIUseCase])],
  controllers: [AiUseCasesController],
  providers: [AiUseCasesService],
  exports: [AiUseCasesService],
})
export class AiUseCasesModule {}
