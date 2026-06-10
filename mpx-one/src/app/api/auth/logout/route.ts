import { NextResponse } from 'next/server'
import { clearSession, logoutUrl } from '@/lib/auth-server'

export async function GET() {
  await clearSession()
  return NextResponse.redirect(logoutUrl())
}

export const dynamic = 'force-dynamic'
