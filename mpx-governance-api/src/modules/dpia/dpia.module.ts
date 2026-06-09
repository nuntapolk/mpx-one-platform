import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Dpia } from '../../database/entities/dpia.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { DpiaController } from './dpia.controller'
import { DpiaService } from './dpia.service'

@Module({
  imports: [TypeOrmModule.forFeature([Dpia, RopaActivity])],
  controllers: [DpiaController],
  providers: [DpiaService],
})
export class DpiaModule {}
