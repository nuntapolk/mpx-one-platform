import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { RiskRegistersService } from './risk-registers.service'

@ApiTags('Risk Registers')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/risk-registers')
export class RiskRegistersController {
  constructor(private readonly svc: RiskRegistersService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Risk stats for dashboard' })
  getStats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }

  @Get('heatmap')
  @ApiOperation({ summary: 'Risk heatmap 5×5 matrix data' })
  getHeatmap(@Req() req: any) { return this.svc.getHeatmapData(req.user?.organization_id ?? 'default') }

  @Get()      findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }

  @Post()     create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, req.user?.organization_id ?? 'default') }

  @Get(':id/action-plans')
  getActionPlans(@Param('id') id: string) { return this.svc.getActionPlans(id) }

  @Post(':id/action-plans')
  createActionPlan(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.createActionPlan(id, body, req.user?.organization_id ?? 'default')
  }
}
