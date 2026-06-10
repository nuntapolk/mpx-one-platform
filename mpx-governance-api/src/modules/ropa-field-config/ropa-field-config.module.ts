import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RopaFieldConfig } from '../../database/entities/ropa-field-config.entity'
import { RopaFieldConfigController } from './ropa-field-config.controller'
import { RopaFieldConfigService } from './ropa-field-config.service'

@Module({
  imports: [TypeOrmModule.forFeature([RopaFieldConfig])],
  controllers: [RopaFieldConfigController],
  providers: [RopaFieldConfigService],
})
export class RopaFieldConfigModule {}
