import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { DsarService } from './dsar.service'

@ApiTags('PDPA · Rights Requests (DSAR)')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/dsar')
export class DsarController {
  constructor(private readonly svc: DsarService) {}

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id/status') updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.svc.updateStatus(id, status, req.user?.organization_id ?? 'default')
  }
  @Post(':id/verify-identity') verify(@Param('id') id: string, @Req() req: any) {
    return this.svc.verifyIdentity(id, req.user?.id ?? '', req.user?.organization_id ?? 'default')
  }
  @Post(':id/escalate') escalate(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
    return this.svc.escalate(id, reason ?? '', req.user?.organization_id ?? 'default')
  }
  @Post(':id/notes') addNote(@Param('id') id: string, @Body('note') note: string, @Req() req: any) {
    return this.svc.addNote(id, note, req.user?.name ?? req.user?.email ?? 'system')
  }
}
