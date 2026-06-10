import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { WorkflowService } from './workflow.service'

@ApiTags('PDPA · Workflow')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/workflows')
export class WorkflowController {
  constructor(private readonly svc: WorkflowService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(this.org(req)) }

  // Instances
  @Get('instances') instances(@Req() req: any) { return this.svc.findAllInstances(this.org(req)) }
  @Post('instances') start(@Body() body: any, @Req() req: any) { return this.svc.startInstance(body, this.org(req)) }
  @Post('instances/:id/advance') advance(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.advanceInstance(id, body, this.org(req)) }
  @Post('instances/:id/cancel') cancel(@Param('id') id: string, @Req() req: any) { return this.svc.cancelInstance(id, this.org(req)) }

  // Templates
  @Get() findAll(@Req() req: any) { return this.svc.findAllTemplates(this.org(req)) }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findTemplate(id, this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.createTemplate(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateTemplate(id, body, this.org(req)) }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.removeTemplate(id, this.org(req)) }
}
