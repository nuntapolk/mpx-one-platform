import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { KeycloakGuard } from '../../common/guards/keycloak.guard'
import { ImportExportService } from './import-export.service'

@ApiTags('Import / Export')
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
@Controller('api/v1/import-export')
export class ImportExportController {
  constructor(private readonly svc: ImportExportService) {}

  @Get('types')
  @ApiOperation({ summary: 'List supported import/export types' })
  types() { return this.svc.listTypes() }

  @Get('export/:type')
  @ApiOperation({ summary: 'Export records as Excel' })
  async export(@Param('type') type: string, @Req() req: any, @Res() res: Response) {
    const buf = await this.svc.exportExcel(type, req.user?.organization_id ?? 'default')
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${type}-export.xlsx"`,
    })
    res.send(buf)
  }

  @Get('template/:type')
  @ApiOperation({ summary: 'Download empty import template' })
  async template(@Param('type') type: string, @Res() res: Response) {
    const buf = await this.svc.exportTemplate(type)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${type}-template.xlsx"`,
    })
    res.send(buf)
  }

  @Post('preview/:type')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Excel and preview validation' })
  @UseInterceptors(FileInterceptor('file'))
  async preview(@Param('type') type: string, @UploadedFile() file: any) {
    const rows = await this.svc.parseExcel(type, file.buffer)
    return this.svc.validate(type, rows)
  }

  @Post('commit/:type')
  @ApiOperation({ summary: 'Commit validated rows' })
  async commit(@Param('type') type: string, @Body('rows') rows: any[], @Req() req: any) {
    return this.svc.commit(type, rows ?? [], req.user?.organization_id ?? 'default')
  }
}
