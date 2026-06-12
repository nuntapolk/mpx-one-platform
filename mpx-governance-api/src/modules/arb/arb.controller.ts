import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ArbService } from './arb.service'

@ApiTags('EA Portfolio · ARB')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/arb')
export class ArbController {
  constructor(private readonly svc: ArbService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('dashboard') dashboard(@Req() req: any) { return this.svc.getDashboard(this.org(req)) }
  @Get() findAll(@Req() req: any) { return this.svc.findAll(this.org(req)) }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, this.org(req)) }
  @Post(':id/decide') decide(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.decide(id, body, this.org(req)) }
  @Post(':id/findings') addFinding(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.addFinding(id, body, this.org(req)) }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, this.org(req)) }
}
