import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { EvidencesService } from './evidences.service'

@ApiTags('Evidences')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/evidences')
export class EvidencesController {
  constructor(private readonly service: EvidencesService) {}

  @Get()         findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get('alerts/expiry') getExpiry(@Req() req: any) { return this.service.getExpiryAlerts(req.user?.organization_id ?? 'default') }
  @Get(':id')    findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Get(':id/links') getLinks(@Param('id') id: string) { return this.service.getLinks(id) }
  @Post()        create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Post(':id/links') addLink(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.addLink({ ...body, evidence_id: id, created_by: req.user?.id }) }
  @Put(':id')    update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Post(':id/accept') accept(@Param('id') id: string, @Req() req: any) { return this.service.accept(id, req.user?.id, req.user?.organization_id ?? 'default') }
  @Post(':id/reject') reject(@Param('id') id: string, @Body('comment') comment: string, @Req() req: any) { return this.service.reject(id, req.user?.id, comment, req.user?.organization_id ?? 'default') }
  @Delete(':id/links/:linkId') removeLink(@Param('linkId') linkId: string) { return this.service.removeLink(linkId) }
}
