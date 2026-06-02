import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Framework } from '../../database/entities/framework.entity'
import { Obligation } from '../../database/entities/obligation.entity'
import { FrameworksController } from './frameworks.controller'
import { FrameworksService } from './frameworks.service'

@Module({
  imports: [TypeOrmModule.forFeature([Framework, Obligation])],
  controllers: [FrameworksController],
  providers: [FrameworksService],
  exports: [FrameworksService],
})
export class FrameworksModule {}
