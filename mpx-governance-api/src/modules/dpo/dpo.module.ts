import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DpoTask } from '../../database/entities/dpo-task.entity'
import { DpoController } from './dpo.controller'
import { DpoService } from './dpo.service'

@Module({
  imports: [TypeOrmModule.forFeature([DpoTask])],
  controllers: [DpoController],
  providers: [DpoService],
  exports: [DpoService],
})
export class DpoModule {}
