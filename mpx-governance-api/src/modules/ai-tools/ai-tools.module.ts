import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AITool } from '../../database/entities/ai-tool.entity'
import { AIToolsController } from './ai-tools.controller'
import { AIToolsService } from './ai-tools.service'

@Module({
  imports: [TypeOrmModule.forFeature([AITool])],
  controllers: [AIToolsController],
  providers: [AIToolsService],
})
export class AIToolsModule {}
