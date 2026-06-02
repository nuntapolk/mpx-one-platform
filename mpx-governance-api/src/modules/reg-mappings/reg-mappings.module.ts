import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegMapping } from '../../database/entities/reg-mapping.entity'
import { RegMappingsController } from './reg-mappings.controller'
import { RegMappingsService } from './reg-mappings.service'

@Module({
  imports: [TypeOrmModule.forFeature([RegMapping])],
  controllers: [RegMappingsController],
  providers: [RegMappingsService],
})
export class RegMappingsModule {}
