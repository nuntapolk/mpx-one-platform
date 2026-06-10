import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessReview } from '../../database/entities/access-review.entity'
import { AccessReviewController } from './access-review.controller'
import { AccessReviewService } from './access-review.service'

@Module({
  imports: [TypeOrmModule.forFeature([AccessReview])],
  controllers: [AccessReviewController],
  providers: [AccessReviewService],
})
export class AccessReviewModule {}
