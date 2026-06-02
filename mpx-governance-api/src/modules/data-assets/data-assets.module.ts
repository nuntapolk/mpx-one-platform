import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataAsset } from '../../database/entities/data-asset.entity'
import { DataAssetsController } from './data-assets.controller'
import { DataAssetsService } from './data-assets.service'

@Module({
  imports: [TypeOrmModule.forFeature([DataAsset])],
  controllers: [DataAssetsController],
  providers: [DataAssetsService],
})
export class DataAssetsModule {}
