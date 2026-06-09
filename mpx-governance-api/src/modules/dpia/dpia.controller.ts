import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { DpiaService } from './dpia.service'

@ApiTags('PDPA · DPIA')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/dpia')
export class DpiaController {
  constructor(private readonly svc: DpiaService) {}

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get('candidates') candidates(@Req() req: any) { return this.svc.candidates(req.user?.organization_id ?? 'default') }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }
  @Put(':id/status') transition(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.svc.transition(id, status, req.user?.organization_id ?? 'default')
  }
  @Post(':id/consult-pdpc') consult(@Param('id') id: string, @Req() req: any) { return this.svc.consultPdpc(id, req.user?.organization_id ?? 'default') }
}
