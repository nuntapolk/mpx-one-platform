import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CookieBannerSetting } from '../../database/entities/cookie-banner.entity'
import { CookieConsent } from '../../database/entities/cookie-consent.entity'
import { CookieController } from './cookie.controller'
import { CookieService } from './cookie.service'

@Module({
  imports: [TypeOrmModule.forFeature([CookieBannerSetting, CookieConsent])],
  controllers: [CookieController],
  providers: [CookieService],
})
export class CookieModule {}
