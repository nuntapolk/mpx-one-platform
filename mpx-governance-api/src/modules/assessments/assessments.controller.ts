import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AssessmentsService } from './assessments.service'

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/assessments')
export class AssessmentsController {
  constructor(private readonly svc: AssessmentsService) {}

  // ── Templates ────────────────────────────────────────────────
  @Get('templates')
  getTemplates(@Req() req: any) { return this.svc.findAllTemplates(req.user?.organization_id ?? 'default') }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string, @Req() req: any) { return this.svc.findOneTemplate(id, req.user?.organization_id ?? 'default') }

  @Get('templates/:id/controls')
  @ApiOperation({ summary: 'Template with controls' })
  getTemplateWithControls(@Param('id') id: string, @Req() req: any) { return this.svc.findTemplateWithControls(id, req.user?.organization_id ?? 'default') }

  @Post('templates')
  createTemplate(@Body() body: any, @Req() req: any) { return this.svc.createTemplate(body, req.user?.organization_id ?? 'default') }

  @Put('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateTemplate(id, body, req.user?.organization_id ?? 'default') }

  @Post('templates/:id/controls')
  addControl(@Param('id') id: string, @Body('control_id') cid: string, @Req() req: any) { return this.svc.addControlToTemplate(id, cid, req.user?.organization_id ?? 'default') }

  @Delete('templates/:id/controls/:controlId')
  removeControl(@Param('id') id: string, @Param('controlId') cid: string) { return this.svc.removeControlFromTemplate(id, cid) }

  // ── Assessments ──────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Assessment stats for dashboard' })
  getStats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }

  @Get()
  findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Assessment with progress and score' })
  findProgress(@Param('id') id: string, @Req() req: any) { return this.svc.findOneWithProgress(id, req.user?.organization_id ?? 'default') }

  @Get(':id/responses')
  getResponses(@Param('id') id: string) { return this.svc.getResponses(id) }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }

  @Post(':id/responses')
  upsertResponse(@Param('id') id: string, @Body() body: any) { return this.svc.upsertResponse(id, body) }

  // ── Workflow transitions ─────────────────────────────────────
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.assign(id, body.owner_id, body.due_date, req.user?.organization_id ?? 'default')
  }

  @Post(':id/start')
  start(@Param('id') id: string, @Req() req: any) { return this.svc.start(id, req.user?.organization_id ?? 'default') }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: any) { return this.svc.submit(id, req.user?.organization_id ?? 'default') }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.approve(id, req.user?.id ?? '', body.comment ?? '', req.user?.organization_id ?? 'default')
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.reject(id, req.user?.id ?? '', body.comment ?? '', req.user?.organization_id ?? 'default')
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Req() req: any) { return this.svc.close(id, req.user?.organization_id ?? 'default') }
}
