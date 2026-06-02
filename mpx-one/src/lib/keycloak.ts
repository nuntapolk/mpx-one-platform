'use client'
import Keycloak from 'keycloak-js'

let _keycloak: Keycloak | null = null

export function getKeycloak(): Keycloak {
  if (!_keycloak) {
    _keycloak = new Keycloak({
      url:      process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
      realm:    process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'mpx-one',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'mpx-web',
    })
  }
  return _keycloak
}

export async function initKeycloak(): Promise<boolean> {
  const kc = getKeycloak()
  const authenticated = await kc.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    silentCheckSsoRedirectUri: typeof window !== 'undefined'
      ? `${window.location.origin}/silent-check-sso.html`
      : undefined,
  })
  return authenticated
}

export function login() {
  getKeycloak().login()
}

export function logout() {
  getKeycloak().logout({ redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined })
}
