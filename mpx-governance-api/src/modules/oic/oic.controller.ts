import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { OicService } from './oic.service'

@ApiTags('OIC Audit Readiness')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/oic')
export class OicController {
  constructor(private readonly svc: OicService) {}

  @Get('readiness-dashboard')
  @ApiOperation({ summary: 'OIC readiness score by area + overall' })
  readiness(@Req() req: any) { return this.svc.getReadiness(req.user?.organization_id ?? 'default') }

  @Get('missing-evidence')
  missing(@Req() req: any) { return this.svc.getMissingEvidence(req.user?.organization_id ?? 'default') }

  @Get('requirements')
  findAll(@Req() req: any) { return this.svc.findAll(req.user?.organization_id ?? 'default') }

  @Get('requirements/:id')
  findOne(@Param('id') id: string, @Req() req: any) { return this.svc.findOne(id, req.user?.organization_id ?? 'default') }

  @Post('requirements')
  create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user?.organization_id ?? 'default') }

  @Put('requirements/:id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body, req.user?.organization_id ?? 'default') }

  @Post('requirements/:id/link-evidence')
  linkEvidence(@Param('id') id: string, @Body('evidence_id') eid: string, @Req() req: any) {
    return this.svc.linkEvidence(id, eid, req.user?.organization_id ?? 'default')
  }
}
