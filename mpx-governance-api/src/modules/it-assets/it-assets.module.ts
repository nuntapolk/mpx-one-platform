import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ITAsset } from '../../database/entities/it-asset.entity'
import { ITAssetsController } from './it-assets.controller'
import { ITAssetsService } from './it-assets.service'

@Module({
  imports: [TypeOrmModule.forFeature([ITAsset])],
  controllers: [ITAssetsController],
  providers: [ITAssetsService],
})
export class ITAssetsModule {}
