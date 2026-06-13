import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AiAssessmentService } from './ai-assessment.service'
import { AI_STEPS, AI_PHASES } from './ai-steps'

@ApiTags('AI Governance · Assessment')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/ai-assessments')
export class AiAssessmentController {
  constructor(private readonly svc: AiAssessmentService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('template') template() { return { phases: AI_PHASES, steps: AI_STEPS } }
  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(this.org(req)) }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(this.org(req)) }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, this.org(req)) }
  @Post(':id/step/:no') setStep(@Param('id') id: string, @Param('no') no: string, @Body() body: any, @Req() req: any) { return this.svc.setStep(id, +no, body, this.org(req)) }
  @Post(':id/score/:domain') setScore(@Param('id') id: string, @Param('domain') domain: string, @Body() body: any, @Req() req: any) { return this.svc.setScore(id, domain, +body.score, this.org(req)) }
  @Post(':id/decide') decide(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.decide(id, body, this.org(req)) }
  // P4 — integrations & lifecycle
  @Get(':id/links') links(@Param('id') id: string, @Req() req: any) { return this.svc.getLinks(id, this.org(req)) }
  @Post(':id/link-vendor') linkVendor(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.linkVendor(id, body.vendor_id, this.org(req)) }
  @Post(':id/link-training') linkTraining(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.linkTraining(id, body.training_course_id, this.org(req)) }
  @Post(':id/create-risk') createRisk(@Param('id') id: string, @Req() req: any) { return this.svc.createRisk(id, this.org(req)) }
  @Post(':id/go-live') goLive(@Param('id') id: string, @Req() req: any) { return this.svc.goLive(id, this.org(req)) }
  @Post(':id/retire') retire(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.retire(id, body, this.org(req)) }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, this.org(req)) }
}
