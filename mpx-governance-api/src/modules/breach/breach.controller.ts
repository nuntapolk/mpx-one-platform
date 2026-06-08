import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { BreachService } from './breach.service'

@ApiTags('PDPA · Breach Incident')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/breach')
export class BreachController {
  constructor(private readonly svc: BreachService) {}

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id/status') updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.svc.updateStatus(id, status, req.user?.organization_id ?? 'default')
  }
  @Post(':id/notify-pdpc') notifyPdpc(@Param('id') id: string, @Body('reference') ref: string, @Req() req: any) {
    return this.svc.notifyPdpc(id, ref ?? '', req.user?.organization_id ?? 'default')
  }
  @Post(':id/notify-subjects') notifySubjects(@Param('id') id: string, @Req() req: any) {
    return this.svc.notifySubjects(id, req.user?.organization_id ?? 'default')
  }
  @Post(':id/timeline') addTimeline(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.addTimeline(id, body.action ?? 'note', body.description ?? '', req.user?.name ?? 'system')
  }
}
