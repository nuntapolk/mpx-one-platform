import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Evidence } from '../../database/entities/evidence.entity'
import { EvidenceLink } from '../../database/entities/evidence-link.entity'
import { EvidencesController } from './evidences.controller'
import { EvidencesService } from './evidences.service'

@Module({
  imports: [TypeOrmModule.forFeature([Evidence, EvidenceLink])],
  controllers: [EvidencesController],
  providers: [EvidencesService],
  exports: [EvidencesService],
})
export class EvidencesModule {}
