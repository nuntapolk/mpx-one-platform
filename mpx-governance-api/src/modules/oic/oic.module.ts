import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OicRequirement } from '../../database/entities/oic-requirement.entity'
import { Evidence } from '../../database/entities/evidence.entity'
import { OicController } from './oic.controller'
import { OicService } from './oic.service'

@Module({
  imports: [TypeOrmModule.forFeature([OicRequirement, Evidence])],
  controllers: [OicController],
  providers: [OicService],
  exports: [OicService],
})
export class OicModule {}
