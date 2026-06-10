import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ReportsService } from './reports.service'

@ApiTags('PDPA · Reports & Analytics')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}
  @Get() getReport(@Req() req: any) { return this.svc.getReport(req.user?.organization_id ?? 'default') }
}
