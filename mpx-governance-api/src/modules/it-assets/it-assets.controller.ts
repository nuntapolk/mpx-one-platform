import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ITAssetsService } from './it-assets.service'
import { ITAsset } from '../../database/entities/it-asset.entity'

@ApiTags('IT Assets')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/it-assets')
export class ITAssetsController {
  constructor(private readonly service: ITAssetsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user?.organization_id ?? 'default')
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user?.organization_id ?? 'default')
  }

  @Post()
  create(@Body() body: Partial<ITAsset>, @Req() req: any) {
    return this.service.create(body, req.user?.organization_id ?? 'default')
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ITAsset>, @Req() req: any) {
    return this.service.update(id, body, req.user?.organization_id ?? 'default')
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user?.organization_id ?? 'default')
  }
}
