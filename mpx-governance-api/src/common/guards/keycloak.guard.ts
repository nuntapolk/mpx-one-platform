import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwksRsa = require('jwks-rsa')
import type { JwksClient } from 'jwks-rsa'

@Injectable()
export class KeycloakGuard implements CanActivate {
  private readonly jwksClient: JwksClient

  constructor(private config: ConfigService) {
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

    // Dev bypass: allow requests without token in development mode
    if (process.env.NODE_ENV === 'development' && !authHeader) {
      request.user = {
        id: 'dev-user',
        email: 'dev@mpx.local',
        name: 'Dev User',
        roles: ['admin'],
        organization_id: process.env.DEV_ORG_ID || '08803204-c8d5-4f13-bf66-1e40d5ee4adc',
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

      request.user = {
        id: verified.sub,
        email: verified.email,
        name: verified.name,
        roles: verified.realm_access?.roles ?? [],
        organization_id: verified.organization_id ?? null,
      }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
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
