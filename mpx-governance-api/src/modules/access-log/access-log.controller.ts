import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AccessLogService } from './access-log.service'

// Read-only — access logs are append-only and must not be mutable via API.
@ApiTags('Logging · Access Logs')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/access-logs')
export class AccessLogController {
  constructor(private readonly svc: AccessLogService) {}
  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get() findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(req.user?.organization_id ?? 'default', {
      resource_type: q.resource_type, action: q.action, user_email: q.user_email, limit: q.limit ? +q.limit : undefined,
    })
  }
}
