import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ConsentService } from './consent.service'

@ApiTags('PDPA · Consent')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/consent')
export class ConsentController {
  constructor(private readonly svc: ConsentService) {}

  @Get('stats') getStats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }

  // Consents
  @Get() findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get('by-subject/:id') bySubject(@Param('id') id: string, @Req() req: any) { return this.svc.findBySubject(id, req.user?.organization_id ?? 'default') }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Post(':id/withdraw') withdraw(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
    return this.svc.withdraw(id, reason ?? '', req.user?.organization_id ?? 'default')
  }

  // Templates
  @Get('templates/list') templates(@Req() req: any) { return this.svc.findTemplates(req.user?.organization_id ?? 'default') }
  @Post('templates') createTemplate(@Body() body: any, @Req() req: any) { return this.svc.createTemplate(body, req.user?.organization_id ?? 'default') }
  @Put('templates/:id') updateTemplate(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateTemplate(id, body, req.user?.organization_id ?? 'default') }

  // Data Subjects
  @Get('subjects/list') subjects(@Req() req: any) { return this.svc.findSubjects(req.user?.organization_id ?? 'default') }
  @Post('subjects') createSubject(@Body() body: any, @Req() req: any) { return this.svc.createSubject(body, req.user?.organization_id ?? 'default') }
}
