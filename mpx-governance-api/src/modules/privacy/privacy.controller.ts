import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { PrivacyService } from './privacy.service'

@ApiTags('PDPA · Privacy Notice & Retention')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/privacy')
export class PrivacyController {
  constructor(private readonly svc: PrivacyService) {}

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }

  // Notices
  @Get('notices') notices(@Req() req: any) { return this.svc.findNotices(req.user?.organization_id ?? 'default') }
  @Post('notices') createNotice(@Body() body: any, @Req() req: any) { return this.svc.createNotice(body, req.user?.organization_id ?? 'default') }
  @Put('notices/:id') updateNotice(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateNotice(id, body, req.user?.organization_id ?? 'default') }
  @Post('notices/:id/publish') publish(@Param('id') id: string, @Req() req: any) { return this.svc.publishNotice(id, req.user?.organization_id ?? 'default') }

  // Retention
  @Get('retention') retention(@Req() req: any) { return this.svc.findRetention(req.user?.organization_id ?? 'default') }
  @Post('retention') createRetention(@Body() body: any, @Req() req: any) { return this.svc.createRetention(body, req.user?.organization_id ?? 'default') }
  @Put('retention/:id') updateRetention(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateRetention(id, body, req.user?.organization_id ?? 'default') }
  @Delete('retention/:id') removeRetention(@Param('id') id: string, @Req() req: any) { return this.svc.removeRetention(id, req.user?.organization_id ?? 'default') }
}
