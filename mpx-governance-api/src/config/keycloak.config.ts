import { registerAs } from '@nestjs/config'

export default registerAs('keycloak', () => ({
  url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'mpx-one',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'mpx-api',
}))
