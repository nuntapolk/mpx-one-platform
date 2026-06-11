import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessLog } from '../../database/entities/access-log.entity'
import { AuditTrail } from '../../database/entities/audit-trail.entity'
import { AccessLogController } from './access-log.controller'
import { AccessLogService } from './access-log.service'
import { LogRetentionService } from './log-retention.service'

// Global so the AccessLogInterceptor (built in main.ts) can obtain the service.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AccessLog, AuditTrail])],
  controllers: [AccessLogController],
  providers: [AccessLogService, LogRetentionService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
