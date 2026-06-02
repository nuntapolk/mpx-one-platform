import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { RiskRegistersService } from './risk-registers.service'
import { RiskRegister } from '../../database/entities/risk-register.entity'

@ApiTags('Risk Registers')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/risk-registers')
export class RiskRegistersController {
  constructor(private readonly service: RiskRegistersService) {}

  @Get()    findAll(@Req() req: any) { return this.service.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user?.organization_id ?? 'default') }
  @Post()   create(@Body() body: Partial<RiskRegister>, @Req() req: any) { return this.service.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id') update(@Param('id') id: string, @Body() body: Partial<RiskRegister>, @Req() req: any) { return this.service.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user?.organization_id ?? 'default') }
}
