import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AssessmentsService } from './assessments.service'

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/assessments')
export class AssessmentsController {
  constructor(private readonly service: AssessmentsService) {}

  // Templates
  @Get('templates')    getTemplates(@Req() req: any) { return this.service.findAllTemplates(req.user?.organization_id ?? 'default') }
  @Get('templates/:id') getTemplate(@Param('id') id: string, @Req() req: any) { return this.service.findOneTemplate(id, req.user?.organization_id ?? 'default') }
  @Post('templates')   createTemplate(@Body() body: any, @Req() req: any) { return this.service.createTemplate(body, req.user?.organization_id ?? 'default') }
  @Put('templates/:id') updateTemplate(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.updateTemplate(id, body, req.user?.organization_id ?? 'default') }

  // Assessments
  @Get()    findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Get(':id/responses') getResponses(@Param('id') id: string) { return this.service.getResponses(id) }
  @Post()   create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Post(':id/responses') upsertResponse(@Body() body: any) { return this.service.upsertResponse(body) }
  @Post(':id/submit')  submit(@Param('id') id: string, @Req() req: any) { return this.service.submit(id, req.user?.organization_id ?? 'default') }
  @Post(':id/approve') approve(@Param('id') id: string, @Req() req: any) { return this.service.approve(id, req.user?.organization_id ?? 'default') }
  @Post(':id/reject')  reject(@Param('id') id: string, @Body('comment') comment: string, @Req() req: any) { return this.service.reject(id, comment, req.user?.organization_id ?? 'default') }
}
