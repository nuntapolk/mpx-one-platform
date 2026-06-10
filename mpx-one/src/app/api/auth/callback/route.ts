import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode, setSession, COOKIE, APP_URL } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const verifier = req.cookies.get(COOKIE.pkce)?.value
  const savedState = req.cookies.get(COOKIE.state)?.value

  if (!code || !verifier || !state || state !== savedState) {
    return NextResponse.redirect(`${APP_URL}/login?error=invalid_callback`)
  }

  try {
    const tokens = await exchangeCode(code, verifier)
    await setSession(tokens)
    const res = NextResponse.redirect(`${APP_URL}/dashboard`)
    res.cookies.delete(COOKIE.pkce)
    res.cookies.delete(COOKIE.state)
    return res
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=token_exchange`)
  }
}

export const dynamic = 'force-dynamic'
