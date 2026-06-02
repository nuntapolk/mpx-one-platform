import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { RegMappingsService } from './reg-mappings.service'
import { RegMapping } from '../../database/entities/reg-mapping.entity'

@ApiTags('Regulatory Mappings')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/reg-mappings')
export class RegMappingsController {
  constructor(private readonly service: RegMappingsService) {}

  @Get()    findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Post()   create(@Body() body: Partial<RegMapping>, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: Partial<RegMapping>, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user?.organization_id ?? 'default') }
}
