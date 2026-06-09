import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { DataMapService } from './data-map.service'

@ApiTags('PDPA · Data Map')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/data-map')
export class DataMapController {
  constructor(private readonly svc: DataMapService) {}
  @Get() getMap(@Req() req: any) { return this.svc.getMap(req.user?.organization_id ?? 'default') }
}
