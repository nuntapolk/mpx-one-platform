import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessLog } from '../../database/entities/access-log.entity'
import { AccessLogController } from './access-log.controller'
import { AccessLogService } from './access-log.service'

// Global so the AccessLogInterceptor (built in main.ts) can obtain the service.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AccessLog])],
  controllers: [AccessLogController],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
