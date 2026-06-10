import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/auth-server'

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || 'http://localhost:4000'

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const target = `${API_INTERNAL_URL}/${path.join('/')}${new URL(req.url).search}`

  const headers = new Headers()
  const ct = req.headers.get('content-type'); if (ct) headers.set('content-type', ct)
  const token = await getValidAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  const method = req.method
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer()

  const res = await fetch(target, { method, headers, body, cache: 'no-store', redirect: 'manual' })
  const buf = await res.arrayBuffer()
  const out = new NextResponse(buf, { status: res.status })
  const resCt = res.headers.get('content-type'); if (resCt) out.headers.set('content-type', resCt)
  out.headers.set('cache-control', 'no-store')
  return out
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const dynamic = 'force-dynamic'
