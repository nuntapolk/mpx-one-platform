import { Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { StorageService } from './storage.service'

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}
  private org(req: any) { return req.user?.organization_id ?? 'default' }

  @Get('status') status() { return { enabled: this.storage.enabled } }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any, @Req() req: any) {
    if (!file) throw new BadRequestException('file is required (multipart field "file")')
    const { key, size } = await this.storage.upload(this.org(req), file)
    const url = await this.storage.presignedGet(key)
    return { key, size, filename: file.originalname, mimetype: file.mimetype, url }
  }

  @Get('presign') async presign(@Query('key') key: string, @Query('expires') expires?: string) {
    if (!key) throw new BadRequestException('key is required')
    return { key, url: await this.storage.presignedGet(key, expires ? Number(expires) : 3600) }
  }

  @Delete(':key') async remove(@Param('key') key: string) {
    await this.storage.remove(key)
    return { deleted: true, key }
  }
}
