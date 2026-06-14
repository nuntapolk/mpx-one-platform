import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AppContentService } from './app-content.service'

@ApiTags('App Content')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/app-content')
export class AppContentController {
  constructor(private readonly svc: AppContentService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get(':key') get(@Param('key') key: string, @Req() req: any) { return this.svc.get(this.org(req), key) }
  @Put(':key') set(@Param('key') key: string, @Body() body: any, @Req() req: any) {
    return this.svc.set(this.org(req), key, body?.value, req.user)
  }
}
