import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuditTrail } from '../../database/entities/audit-trail.entity'
import { AuditTrailController } from './audit-trail.controller'
import { AuditTrailService } from './audit-trail.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
