import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExternalParty } from '../../database/entities/external-party.entity'
import { ExternalPartiesController } from './external-parties.controller'
import { ExternalPartiesService } from './external-parties.service'

@Module({
  imports: [TypeOrmModule.forFeature([ExternalParty])],
  controllers: [ExternalPartiesController],
  providers: [ExternalPartiesService],
  exports: [ExternalPartiesService],
})
export class ExternalPartiesModule {}
