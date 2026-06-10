// Server-only Keycloak BFF helpers. Tokens live in httpOnly cookies; the browser never sees them.
import 'server-only'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true'
const ISSUER = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/mpx-one'
const CLIENT_ID = process.env.KEYCLOAK_BFF_CLIENT_ID || 'mpx-bff'
const CLIENT_SECRET = process.env.KEYCLOAK_BFF_CLIENT_SECRET || 'mpx-bff-dev-secret'
export const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const REDIRECT_URI = `${APP_URL}/api/auth/callback`

export const COOKIE = { access: 'kc_access', refresh: 'kc_refresh', expires: 'kc_expires', pkce: 'kc_pkce', state: 'kc_state' }
const ep = (p: string) => `${ISSUER}/protocol/openid-connect/${p}`

const baseCookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }

// ── PKCE ──
export function makePkce() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  const state = crypto.randomBytes(16).toString('base64url')
  return { verifier, challenge, state }
}

export function authorizeUrl(challenge: string, state: string) {
  const q = new URLSearchParams({
    client_id: CLIENT_ID, response_type: 'code', scope: 'openid profile email',
    redirect_uri: REDIRECT_URI, code_challenge: challenge, code_challenge_method: 'S256', state,
  })
  return `${ep('auth')}?${q.toString()}`
}

export function logoutUrl() {
  const q = new URLSearchParams({ client_id: CLIENT_ID, post_logout_redirect_uri: APP_URL })
  return `${ep('logout')}?${q.toString()}`
}

// ── Token exchange / refresh ──
async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(ep('token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...body }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>
}

export const exchangeCode = (code: string, verifier: string) =>
  tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, code_verifier: verifier })

export const refreshTokens = (refresh: string) =>
  tokenRequest({ grant_type: 'refresh_token', refresh_token: refresh })

// ── Cookie session helpers ──
export async function setSession(t: { access_token: string; refresh_token: string; expires_in: number }) {
  const jar = await cookies()
  jar.set(COOKIE.access, t.access_token, baseCookie)
  jar.set(COOKIE.refresh, t.refresh_token, { ...baseCookie, maxAge: 60 * 60 * 24 * 7 })
  jar.set(COOKIE.expires, String(Date.now() + (t.expires_in - 30) * 1000), baseCookie)
}

export async function clearSession() {
  const jar = await cookies()
  for (const k of Object.values(COOKIE)) jar.delete(k)
}

// Returns a valid access token, refreshing if needed. null if no session.
export async function getValidAccessToken(): Promise<string | null> {
  const jar = await cookies()
  const access = jar.get(COOKIE.access)?.value
  const refresh = jar.get(COOKIE.refresh)?.value
  const expires = Number(jar.get(COOKIE.expires)?.value || 0)
  if (!access && !refresh) return null
  if (access && Date.now() < expires) return access
  if (!refresh) return null
  try {
    const t = await refreshTokens(refresh)
    await setSession(t)
    return t.access_token
  } catch {
    await clearSession()
    return null
  }
}

// Decode JWT payload (no verification — backend verifies; this is only for display).
export function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch { return null }
}
