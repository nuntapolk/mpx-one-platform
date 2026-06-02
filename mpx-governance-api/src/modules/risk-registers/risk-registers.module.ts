import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { RiskRegistersController } from './risk-registers.controller'
import { RiskRegistersService } from './risk-registers.service'

@Module({
  imports: [TypeOrmModule.forFeature([RiskRegister])],
  controllers: [RiskRegistersController],
  providers: [RiskRegistersService],
})
export class RiskRegistersModule {}
