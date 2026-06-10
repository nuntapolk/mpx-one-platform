'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

// Routes that never require a session
const isPublicPath = (p: string) => p === '/login' || p.startsWith('/portal') || p.startsWith('/api')

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, authEnabled, authenticated, setSession } = useAuthStore()

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setSession({ authEnabled: d.auth_enabled, authenticated: d.authenticated, user: d.user }))
      .catch(() => setSession({ authEnabled: false, authenticated: false, user: null }))
  }, [setSession])

  useEffect(() => {
    if (!ready) return
    if (authEnabled && !authenticated && !isPublicPath(pathname)) {
      router.replace('/login')
    }
  }, [ready, authEnabled, authenticated, pathname, router])

  // Block protected content flash until session is known
  if (!ready && !isPublicPath(pathname)) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">กำลังตรวจสอบสิทธิ์...</div>
  }
  if (ready && authEnabled && !authenticated && !isPublicPath(pathname)) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">กำลังพาไปหน้าเข้าสู่ระบบ...</div>
  }
  return <>{children}</>
}
