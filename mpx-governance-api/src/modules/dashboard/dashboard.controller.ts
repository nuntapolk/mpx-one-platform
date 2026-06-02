import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOkResponse({ description: 'Cross-module KPI summary' })
  summary(@Req() req: any) {
    return this.service.getSummary(req.user?.organization_id ?? 'default')
  }
}
