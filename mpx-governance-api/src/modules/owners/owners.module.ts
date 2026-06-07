import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OwnerAssignment } from '../../database/entities/owner-assignment.entity'
import { OwnersController } from './owners.controller'
import { OwnersService } from './owners.service'

@Module({
  imports: [TypeOrmModule.forFeature([OwnerAssignment])],
  controllers: [OwnersController],
  providers: [OwnersService],
})
export class OwnersModule {}
