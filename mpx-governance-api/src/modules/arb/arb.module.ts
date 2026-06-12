import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArbRequest } from '../../database/entities/arb-request.entity'
import { ArbController } from './arb.controller'
import { ArbService } from './arb.service'

@Module({
  imports: [TypeOrmModule.forFeature([ArbRequest])],
  controllers: [ArbController],
  providers: [ArbService],
})
export class ArbModule {}
