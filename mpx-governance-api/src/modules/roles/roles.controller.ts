import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { RolesService } from './roles.service'

@ApiTags('Platform · Roles & Permissions')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/roles')
export class RolesController {
  constructor(private readonly svc: RolesService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get() findAll(@Req() req: any) { return this.svc.findAll(this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, this.org(req)) }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, this.org(req)) }
}
