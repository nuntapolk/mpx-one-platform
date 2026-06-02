import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AuditTrailService } from './audit-trail.service'

@ApiTags('Audit Trail')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/audit-trail')
export class AuditTrailController {
  constructor(private readonly service: AuditTrailService) {}

  @Get()
  @ApiQuery({ name: 'object_type', required: false })
  findAll(@Req() req: any, @Query('object_type') objectType?: string) {
    return this.service.findAll(req.user?.organization_id ?? 'default', objectType)
  }

  @Get(':type/:id')
  findByObject(@Param('type') type: string, @Param('id') id: string, @Req() req: any) {
    return this.service.findByObject(type, id, req.user?.organization_id ?? 'default')
  }
}
