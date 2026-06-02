import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChangeRequest } from '../../database/entities/change-request.entity'
import { ChangeRequestsController } from './change-requests.controller'
import { ChangeRequestsService } from './change-requests.service'

@Module({
  imports: [TypeOrmModule.forFeature([ChangeRequest])],
  controllers: [ChangeRequestsController],
  providers: [ChangeRequestsService],
})
export class ChangeRequestsModule {}
