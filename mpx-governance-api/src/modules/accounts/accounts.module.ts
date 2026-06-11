import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppUser } from '../../database/entities/app-user.entity'
import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'

@Module({
  imports: [TypeOrmModule.forFeature([AppUser])],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
