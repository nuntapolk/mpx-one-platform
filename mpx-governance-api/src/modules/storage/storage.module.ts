import { Module, Global } from '@nestjs/common'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

// Global so any module (evidences, import-export) can inject StorageService.
@Global()
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
