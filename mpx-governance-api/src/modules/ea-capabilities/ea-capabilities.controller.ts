import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { EaCapabilitiesService } from './ea-capabilities.service'

@ApiTags('EA Portfolio · Capabilities')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/ea-capabilities')
export class EaCapabilitiesController {
  constructor(private readonly svc: EaCapabilitiesService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('summary') summary(@Req() req: any) { return this.svc.getSummary(this.org(req)) }
  @Get('gaps') gaps(@Req() req: any) { return this.svc.getGaps(this.org(req)) }
  @Get() findAll(@Req() req: any, @Query('domain') domain?: string) { return this.svc.findAll(this.org(req), domain) }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, this.org(req)) }
  @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(body, this.org(req)) }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, this.org(req)) }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, this.org(req)) }

  @Post('coverage') addCoverage(@Body() body: any, @Req() req: any) { return this.svc.addCoverage(body, this.org(req)) }
  @Delete('coverage/:id') removeCoverage(@Param('id') id: string, @Req() req: any) { return this.svc.removeCoverage(id, this.org(req)) }
}
