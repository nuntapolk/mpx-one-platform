import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RopaActivity } from '../../database/entities/ropa.entity'
import { RopaController } from './ropa.controller'
import { RopaService } from './ropa.service'

@Module({
  imports: [TypeOrmModule.forFeature([RopaActivity])],
  controllers: [RopaController],
  providers: [RopaService],
  exports: [RopaService],
})
export class RopaModule {}
