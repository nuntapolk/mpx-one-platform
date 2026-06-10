import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PublicPortalService } from './public-portal.service'

// NOTE: No KeycloakGuard — these endpoints are intentionally public (no auth).
@ApiTags('Public Portal')
@Controller('api/v1/public')
export class PublicPortalController {
  constructor(private readonly svc: PublicPortalService) {}

  // Rights (DSAR) portal
  @Get('rights/:slug') getOrg(@Param('slug') slug: string) { return this.svc.getOrgBySlug(slug) }
  @Post('rights/:slug') submitRights(@Param('slug') slug: string, @Body() body: any) { return this.svc.submitRights(slug, body) }

  // ROPA Campaign portal
  @Get('ropa-campaign/:token') getCampaign(@Param('token') token: string) { return this.svc.getCampaign(token) }
  @Post('ropa-campaign/:token/submit') submitCampaign(@Param('token') token: string, @Body() body: any) { return this.svc.submitCampaign(token, body) }
}
