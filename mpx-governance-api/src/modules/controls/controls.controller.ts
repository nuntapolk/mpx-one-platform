import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ControlsService } from './controls.service'
import { Control } from '../../database/entities/control.entity'
import { ControlMapping } from '../../database/entities/control-mapping.entity'

@ApiTags('Controls')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/controls')
export class ControlsController {
  constructor(private readonly service: ControlsService) {}

  @Get()    findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Get(':id/mappings') getMappings(@Param('id') id: string, @Req() req: any) { return this.service.getMappings(id, req.user?.organization_id ?? 'default') }
  @Post()   create(@Body() body: Partial<Control>, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Post(':id/mappings') createMapping(@Body() body: Partial<ControlMapping>, @Req() req: any) { return this.service.createMapping({ ...body, control_id: undefined }, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: Partial<Control>, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user?.organization_id ?? 'default') }
  @Delete(':id/mappings/:mappingId') removeMapping(@Param('mappingId') mappingId: string, @Req() req: any) { return this.service.removeMapping(mappingId, req.user?.organization_id ?? 'default') }
}
