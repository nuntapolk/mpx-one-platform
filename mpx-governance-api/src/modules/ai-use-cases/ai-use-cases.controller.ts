import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { AiUseCasesService } from './ai-use-cases.service'

@ApiTags('AI Use Cases')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/ai-use-cases')
export class AiUseCasesController {
  constructor(private readonly svc: AiUseCasesService) {}

  @Get('stats') getStats(@Req() req: any) { return this.svc.getStats(req.user?.organization_id ?? 'default') }
  @Get()        findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }
  @Get(':id')   findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }
  @Post()       create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }
  @Put(':id')   update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, req.user?.organization_id ?? 'default') }
}
