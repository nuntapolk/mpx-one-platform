import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppUser } from '../../database/entities/app-user.entity'
import { Organization } from '../../database/entities/organization.entity'
import { KeycloakGuard } from '../guards/keycloak.guard'

// Global so `@UseGuards(KeycloakGuard)` in any module resolves the guard
// with its AppUser/Organization repositories available.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AppUser, Organization])],
  providers: [KeycloakGuard],
  exports: [KeycloakGuard, TypeOrmModule],
})
export class AuthCommonModule {}
