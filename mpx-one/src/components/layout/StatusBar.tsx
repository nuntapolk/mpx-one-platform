'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { APP_VERSION } from '@/lib/version'

export default function StatusBar() {
  const { user, authEnabled, authenticated } = useAuthStore()
  const [now, setNow] = useState<string>('')

  useEffect(() => {
    const fmt = () => new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).replace(',', ' ·')
    setNow(fmt())
    const t = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(t)
  }, [])

  const name = user?.name || user?.email || 'MPX Admin'
  const role = user?.roles?.[0] || 'member'

  return (
    <footer
      className="h-[30px] flex-shrink-0 flex items-center gap-2.5 px-3 text-[11px]"
      style={{ background: 'rgba(243,248,253,0.85)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderTop: '1px solid rgba(13,27,62,0.08)' }}
    >
      {/* Logout — icon only (no text) */}
      {authEnabled && authenticated && (
        <a href="/api/auth/logout" title="ออกจากระบบ" aria-label="ออกจากระบบ"
          className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </a>
      )}
      <span className="w-5 h-5 rounded-full text-[10px] font-semibold flex-shrink-0 flex items-center justify-center" style={{ background: '#1D63B0', color: '#fff' }}>
        {name[0].toUpperCase()}
      </span>
      <span style={{ color: 'rgba(13,27,62,0.8)' }}>{name}</span>
      <span className="px-1.5 rounded" style={{ color: '#1D63B0', background: 'rgba(29,99,176,0.1)' }}>{role}</span>

      <span className="flex-1" />

      <span className="font-mono" style={{ color: 'rgba(13,27,62,0.6)' }}>{now}</span>
      <span className="font-mono" style={{ color: 'rgba(13,27,62,0.4)' }}>v{APP_VERSION.full}</span>
    </footer>
  )
}
