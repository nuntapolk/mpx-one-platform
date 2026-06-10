import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as jwt from 'jsonwebtoken'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwksRsa = require('jwks-rsa')
import type { JwksClient } from 'jwks-rsa'
import { AppUser } from '../../database/entities/app-user.entity'
import { Organization } from '../../database/entities/organization.entity'

// Auth is bypassed (dev user injected) when AUTH_ENABLED !== 'true'.
const authEnabled = () => process.env.AUTH_ENABLED === 'true'

@Injectable()
export class KeycloakGuard implements CanActivate {
  private readonly jwksClient: JwksClient

  constructor(
    private config: ConfigService,
    @InjectRepository(AppUser) private users: Repository<AppUser>,
    @InjectRepository(Organization) private orgs: Repository<Organization>,
  ) {
    const url = this.config.get<string>('keycloak.url')
    const realm = this.config.get<string>('keycloak.realm')
    this.jwksClient = jwksRsa({
      jwksUri: `${url}/realms/${realm}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 600000,
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader: string = request.headers['authorization']

    // ── Dev / auth-disabled bypass: inject a dev user ──
    if (!authEnabled()) {
      request.user = {
        id: 'dev-user',
        email: 'dev@mpx.local',
        name: 'Dev User',
        roles: ['admin'],
        organization_id: process.env.DEV_ORG_ID || (await this.defaultOrgId()),
      }
      return true
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token')
    }
    const token = authHeader.slice(7)

    try {
      const decoded = jwt.decode(token, { complete: true })
      if (!decoded || typeof decoded === 'string') throw new Error('Invalid token')

      const key = await this.getSigningKey(decoded.header.kid as string)
      const verified = jwt.verify(token, key) as jwt.JwtPayload

      const email: string = verified.email
      const orgId = verified.organization_id ?? (await this.resolveOrgId(email, verified))

      request.user = {
        id: verified.sub,
        email,
        name: verified.name,
        roles: verified.realm_access?.roles ?? [],
        organization_id: orgId,
      }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  // ── Resolve organization from the app_users table by email; provision on first login ──
  private async resolveOrgId(email: string, verified: jwt.JwtPayload): Promise<string> {
    if (email) {
      const user = await this.users.findOne({ where: { email } })
      if (user?.organization_id) {
        this.users.update({ id: user.id }, { last_login_at: new Date(), keycloak_id: verified.sub }).catch(() => {})
        return user.organization_id
      }
      // Auto-provision into default org on first login
      const defOrg = await this.defaultOrgId()
      await this.users.save(this.users.create({
        email, name: verified.name, keycloak_id: verified.sub,
        organization_id: defOrg, roles: verified.realm_access?.roles ?? [], last_login_at: new Date(),
      } as any))
      return defOrg
    }
    return this.defaultOrgId()
  }

  private async defaultOrgId(): Promise<string> {
    const org = await this.orgs.findOne({ where: { slug: 'default' } })
    return org?.id ?? (process.env.DEV_ORG_ID || '')
  }

  private getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) return reject(err)
        resolve(key!.getPublicKey())
      })
    })
  }
}
