import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Control } from '../../database/entities/control.entity'
import { ControlMapping } from '../../database/entities/control-mapping.entity'
import { ControlsController } from './controls.controller'
import { ControlsService } from './controls.service'

@Module({
  imports: [TypeOrmModule.forFeature([Control, ControlMapping])],
  controllers: [ControlsController],
  providers: [ControlsService],
  exports: [ControlsService],
})
export class ControlsModule {}
