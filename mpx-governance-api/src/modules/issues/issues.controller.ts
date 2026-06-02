import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { IssuesService } from './issues.service'

@ApiTags('Issues & Action Plans')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/issues')
export class IssuesController {
  constructor(private readonly service: IssuesService) {}

  @Get()    findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Post()   create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Get(':id/action-plans') getActionPlans(@Param('id') id: string, @Req() req: any) { return this.service.getActionPlansByIssue(id, req.user?.organization_id ?? 'default') }
  @Post(':id/action-plans') createActionPlan(@Body() body: any, @Req() req: any) { return this.service.createActionPlan({ ...body, issue_id: undefined }, req.user?.organization_id ?? 'default') }
}

// Action Plans standalone endpoint
import { Controller as Ctrl } from '@nestjs/common'

@ApiTags('Issues & Action Plans')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Ctrl('api/v1/action-plans')
export class ActionPlansController {
  constructor(private readonly service: IssuesService) {}

  @Get()    findAll(@Req() req: any) { return this.service.getActionPlans(req.user?.organization_id ?? 'default') }
  @Post()   create(@Body() body: any, @Req() req: any) { return this.service.createActionPlan(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.updateActionPlan(id, body, req.user?.organization_id ?? 'default') }
}
