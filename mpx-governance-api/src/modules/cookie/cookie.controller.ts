import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { CookieService } from './cookie.service'

@ApiTags('PDPA · Cookie Consent')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/cookie')
export class CookieController {
  constructor(private readonly svc: CookieService) {}

  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get('banners') banners(@Req() req: any) { return this.svc.findBanners(req.user?.organization_id ?? 'default') }
  @Post('banners') createBanner(@Body() body: any, @Req() req: any) { return this.svc.createBanner(body, req.user?.organization_id ?? 'default') }
  @Put('banners/:id') updateBanner(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.updateBanner(id, body, req.user?.organization_id ?? 'default') }
  @Get('consents') consents(@Req() req: any) { return this.svc.findConsents(req.user?.organization_id ?? 'default') }
  @Post('consents') record(@Body() body: any, @Req() req: any) { return this.svc.recordConsent(body, req.user?.organization_id ?? 'default') }
}
