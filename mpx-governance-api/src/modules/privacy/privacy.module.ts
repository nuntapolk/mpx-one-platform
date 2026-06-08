import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PrivacyNotice } from '../../database/entities/privacy-notice.entity'
import { RetentionSchedule } from '../../database/entities/retention-schedule.entity'
import { PrivacyController } from './privacy.controller'
import { PrivacyService } from './privacy.service'

@Module({
  imports: [TypeOrmModule.forFeature([PrivacyNotice, RetentionSchedule])],
  controllers: [PrivacyController],
  providers: [PrivacyService],
})
export class PrivacyModule {}
