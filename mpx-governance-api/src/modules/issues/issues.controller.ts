import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { IssuesService } from './issues.service'

@ApiTags('Issues & Action Plans')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/issues')
export class IssuesController {
  constructor(private readonly svc: IssuesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Issue stats for dashboard' })
  getStats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }

  @Get('action-plans/overdue')
  getOverdueActions(@Req() req: any) { return this.svc.getOverdueActions(req.user?.organization_id ?? 'default') }

  @Get('action-plans')
  getActionPlans(@Req() req: any) { return this.svc.getActionPlans(req.user?.organization_id ?? 'default') }

  @Get()      findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }

  @Post()     create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.close(id, req.user?.id ?? '', body.comment ?? '', req.user?.organization_id ?? 'default')
  }

  @Get(':id/action-plans')
  getByIssue(@Param('id') id: string) { return this.svc.getActionPlansByIssue(id) }

  @Post(':id/action-plans')
  createActionPlan(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.createActionPlan(id, body, req.user?.organization_id ?? 'default')
  }

  @Put('action-plans/:id')
  updateActionPlan(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.updateActionPlan(id, body, req.user?.organization_id ?? 'default')
  }

  @Post('action-plans/:id/complete')
  completeActionPlan(@Param('id') id: string, @Body('note') note: string, @Req() req: any) {
    return this.svc.completeActionPlan(id, note ?? '', req.user?.organization_id ?? 'default')
  }
}
