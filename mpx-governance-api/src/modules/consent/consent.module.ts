import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Consent } from '../../database/entities/consent.entity'
import { ConsentTemplate } from '../../database/entities/consent-template.entity'
import { DataSubject } from '../../database/entities/data-subject.entity'
import { ConsentController } from './consent.controller'
import { ConsentService } from './consent.service'

@Module({
  imports: [TypeOrmModule.forFeature([Consent, ConsentTemplate, DataSubject])],
  controllers: [ConsentController],
  providers: [ConsentService],
})
export class ConsentModule {}
