import { NextResponse } from 'next/server'
import { AUTH_ENABLED, decodeJwt, getValidAccessToken } from '@/lib/auth-server'

export async function GET() {
  // Auth disabled → dev user, always "authenticated"
  if (!AUTH_ENABLED) {
    return NextResponse.json({ authenticated: true, auth_enabled: false, user: { name: 'Dev User', email: 'dev@mpx.local', roles: ['admin'] } })
  }
  const token = await getValidAccessToken()
  if (!token) return NextResponse.json({ authenticated: false, auth_enabled: true, user: null })
  const p = decodeJwt(token) || {}
  return NextResponse.json({
    authenticated: true, auth_enabled: true,
    user: { name: p.name || p.preferred_username, email: p.email, roles: p.realm_access?.roles ?? [] },
  })
}

export const dynamic = 'force-dynamic'
