import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataAssetInventory } from '../../database/entities/data-asset-inventory.entity'
import { DataAssetsController } from './data-assets.controller'
import { DataAssetsService } from './data-assets.service'

@Module({
  imports: [TypeOrmModule.forFeature([DataAssetInventory])],
  controllers: [DataAssetsController],
  providers: [DataAssetsService],
  exports: [DataAssetsService],
})
export class DataAssetsModule {}
