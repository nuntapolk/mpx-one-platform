import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AdminService } from './admin.service'

@ApiTags('Admin Configuration')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/admin/lookups')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('categories') categories(@Req() req: any) { return this.svc.categories(req.user?.organization_id ?? 'default') }
  @Get() findAll(@Req() req: any, @Query('category') category?: string) { return this.svc.findAll(req.user?.organization_id ?? 'default', category) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') deactivate(@Param('id') id: string, @Req() req: any) { return this.svc.deactivate(id, req.user?.organization_id ?? 'default') }
}
