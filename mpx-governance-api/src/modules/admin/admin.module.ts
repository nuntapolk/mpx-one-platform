import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lookup } from '../../database/entities/lookup.entity'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [TypeOrmModule.forFeature([Lookup])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
