import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { ITAsset } from '../../database/entities/it-asset.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { AITool } from '../../database/entities/ai-tool.entity'
import { DataAsset } from '../../database/entities/data-asset.entity'
import { ChangeRequest } from '../../database/entities/change-request.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ITAsset, RiskRegister, AITool, DataAsset, ChangeRequest])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
