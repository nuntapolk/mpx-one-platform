import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ReadinessService } from './readiness.service'

const ok = (r: { data: any; meta: any }) => ({ success: true, ...r })

@ApiTags('PDPA · Readiness Score')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/readiness')
export class ReadinessController {
  constructor(private readonly svc: ReadinessService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('overview')   async overview(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.overview(this.org(r), p)) }
  @Get('components') async components(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.components(this.org(r), p)) }
  @Get('modules')    async modules(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.modules(this.org(r), p)) }
  @Get('units')      async units(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.units(this.org(r), p)) }
  @Get('gaps')       async gaps(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.gaps(this.org(r), p)) }
  @Get('actions')    async actions(@Req() r: any, @Query('assessment_period') p?: string) { return ok(await this.svc.actions(this.org(r), p)) }
  @Get('methodology') async methodology(@Req() r: any) { return ok(await this.svc.methodology(this.org(r))) }

  @Post('recalculate')
  async recalculate(@Req() r: any, @Body() body: any) {
    return ok(await this.svc.recalculate(this.org(r), body?.assessment_period, r.user?.id))
  }
}
