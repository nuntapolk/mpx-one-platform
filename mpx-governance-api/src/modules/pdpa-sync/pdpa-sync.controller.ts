import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { PdpaSyncService } from './pdpa-sync.service'

@ApiTags('PDPA · Studio Sync')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/pdpa-sync')
export class PdpaSyncController {
  constructor(private readonly svc: PdpaSyncService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('status') status() { return this.svc.status() }

  // Admin-only manual pull. body: { domains?: ['ropa','dsar','consent'] }
  @Post('run')
  async run(@Req() req: any, @Body() body: any) {
    const roles: string[] = req.user?.roles ?? []
    if (req.user && req.user.id && !roles.includes('admin')) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่ sync ได้' } }
    }
    const out = await this.svc.run(this.org(req), body?.domains)
    return { success: true, ...out }
  }
}
