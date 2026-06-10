import { NextResponse } from 'next/server'
import { authorizeUrl, makePkce, COOKIE, APP_URL } from '@/lib/auth-server'

export async function GET() {
  const { verifier, challenge, state } = makePkce()
  const res = NextResponse.redirect(authorizeUrl(challenge, state))
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 600 }
  res.cookies.set(COOKIE.pkce, verifier, opts)
  res.cookies.set(COOKIE.state, state, opts)
  return res
}

export const dynamic = 'force-dynamic'
