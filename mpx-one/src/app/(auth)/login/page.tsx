'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>
}

function LoginInner() {
  const params = useSearchParams()
  const [authEnabled, setAuthEnabled] = useState<boolean | null>(null)
  const error = params.get('error')

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' }).then(r => r.json()).then(d => {
      setAuthEnabled(d.auth_enabled)
      // already authenticated (or auth disabled) → go to app
      if (!d.auth_enabled || d.authenticated) window.location.href = '/dashboard'
    }).catch(() => setAuthEnabled(true))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#0D1B3E 0%,#15294f 60%,#0D1B3E 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mpx-one-logo.png" alt="MPX-ONE" className="mx-auto h-20 w-auto mb-4 bg-white rounded-2xl px-5 py-3 shadow-lg" />
          <p className="text-sm text-zinc-400 mt-1">Enterprise Governance & PDPA Platform</p>
        </div>

        <div className="rounded-2xl p-7 shadow-xl" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {error && <div className="bg-red-500/15 border border-red-400/30 text-red-200 rounded-lg px-4 py-2.5 text-xs mb-4">เข้าสู่ระบบไม่สำเร็จ ({error}) ลองใหม่อีกครั้ง</div>}
          <h2 className="text-white font-medium mb-1">เข้าสู่ระบบ</h2>
          <p className="text-xs text-zinc-400 mb-5">ยืนยันตัวตนผ่าน Keycloak SSO</p>
          <a href="/api/auth/login" className="block w-full text-center font-medium py-2.5 rounded-lg text-sm transition" style={{ background: '#02C39A', color: '#0D1B3E' }}>
            🔐 เข้าสู่ระบบด้วย Keycloak
          </a>
          {authEnabled === false && (
            <p className="text-[11px] text-amber-300/80 mt-4 text-center">โหมด dev: auth ปิดอยู่ — กำลังพาเข้าระบบอัตโนมัติ</p>
          )}
        </div>
        <p className="text-center text-[11px] text-zinc-500 mt-6">© 2026 MPX-ONE · v1.0</p>
      </div>
    </div>
  )
}
