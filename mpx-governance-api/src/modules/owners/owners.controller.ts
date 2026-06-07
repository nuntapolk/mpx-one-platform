import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { OwnersService } from './owners.service'

@ApiTags('Owner Assignments')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/owners')
export class OwnersController {
  constructor(private readonly svc: OwnersService) {}

  @Get('types') types() { return this.svc.ownerTypes() }
  @Get('summary') summary(@Req() req: any) { return this.svc.summary(req.user?.organization_id ?? 'default') }
  @Get(':objectType/:objectId') forObject(@Param('objectType') t: string, @Param('objectId') id: string, @Req() req: any) {
    return this.svc.forObject(t, id, req.user?.organization_id ?? 'default')
  }
  @Post() assign(@Body() body: any, @Req() req: any) { return this.svc.assign(body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, req.user?.organization_id ?? 'default') }
}
