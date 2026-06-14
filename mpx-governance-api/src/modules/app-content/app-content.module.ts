import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppContent } from '../../database/entities/app-content.entity'
import { AppContentController } from './app-content.controller'
import { AppContentService } from './app-content.service'

@Module({
  imports: [TypeOrmModule.forFeature([AppContent])],
  controllers: [AppContentController],
  providers: [AppContentService],
})
export class AppContentModule {}
