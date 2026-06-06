import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Executive dashboard — governance score + KPIs' })
  summary(@Req() req: any) {
    return this.service.getExecutiveSummary(req.user?.organization_id ?? 'default')
  }

  @Get('operations')
  @ApiOperation({ summary: 'Governance operations dashboard' })
  operations(@Req() req: any) {
    return this.service.getOperationSummary(req.user?.organization_id ?? 'default')
  }
}
