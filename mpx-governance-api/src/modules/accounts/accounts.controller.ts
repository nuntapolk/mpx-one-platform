import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AccountsService, APP_ROLES } from './accounts.service'

@ApiTags('Platform · Accounts')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/accounts')
export class AccountsController {
  constructor(private readonly svc: AccountsService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('roles') roles() { return APP_ROLES }
  @Get('stats') stats(@Req() req: any) { return this.svc.getStats(this.org(req)) }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(this.org(req)) }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, this.org(req)) }
  @Delete(':id') deactivate(@Param('id') id: string, @Req() req: any) { return this.svc.deactivate(id, this.org(req)) }
}
