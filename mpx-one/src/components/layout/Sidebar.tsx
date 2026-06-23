'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { SECTIONS, effectiveAccess, type NavItemDef } from '@/lib/nav'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { APP_VERSION } from '@/lib/version'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : [])

export default function Sidebar() {
  const pathname = usePathname()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const { user, authEnabled, authenticated } = useAuthStore()
  const sidebarHidden = useUiStore((s) => s.sidebarHidden)
  const { data: rolesData } = useSWR(`${API}/api/v1/roles`, fetcher)

  // Match the current user's role keys to role configs; compute effective access.
  const allRoles: any[] = Array.isArray(rolesData) ? rolesData : []
  const myRoleKeys: string[] = user?.roles ?? []
  const myRoles = allRoles.filter(r => myRoleKeys.includes(r.key))
  // Fail-open while config loads or if user has no mapped role (avoid locking out).
  const filtering = allRoles.length > 0 && myRoles.length > 0
  const canSee = (navId: string) => !filtering || effectiveAccess(myRoles, navId) !== 'none'

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)
  const toggle = (id: string) => setOpenSection(prev => (prev === id ? null : id))

  const sections = SECTIONS
    .map(s => ({ ...s, items: s.items.filter(i => canSee(i.id)) }))
    .filter(s => s.items.length > 0)

  return (
    <aside
      className="flex-shrink-0 flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: sidebarHidden ? 0 : 210, background: 'linear-gradient(180deg, #f3f8fd 0%, #dfeaf7 100%)', borderRight: sidebarHidden ? 'none' : '1px solid rgba(13,27,62,0.08)' }}
    >
      <div className="w-[210px] flex-shrink-0 flex flex-col h-full">
      <div className="px-4 pt-1.5 pb-1 flex flex-col items-start" style={{ borderBottom: '1px solid rgba(13,27,62,0.08)' }}>
        <Link href="/about" title="เกี่ยวกับ MPX-ONE" className="w-full flex justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mpx-one-logo.png" alt="MPX-ONE" className="h-auto object-contain" style={{ width: '66%' }} />
        </Link>
        <span className="w-full text-right text-[10px] font-mono tracking-wide -mt-0.5" style={{ color: 'rgba(13,27,62,0.4)' }}>v{APP_VERSION.full}</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* Standalone top-level link (no section) */}
        <div className="px-2 pb-1">
          <NavLink item={{ id: 'about', label: 'About us', icon: 'ℹ️', href: '/dashboard' }} active={pathname === '/dashboard'} onClick={() => {}} />
        </div>
        {sections.map(section => {
          const isOpen = openSection === section.id
          const hasActiveChild = section.items.some(i => isActive(i.href))
          return (
            <div key={section.id} className="px-2">
              <button
                onClick={() => toggle(section.id)}
                className="sidebar-section w-full flex items-center justify-between px-2 py-2 rounded-lg"
                style={{ background: isOpen ? 'rgba(29,99,176,0.08)' : 'transparent' }}
              >
                <span className="text-[10px] tracking-widest font-semibold"
                  style={{ color: isOpen || hasActiveChild ? '#1D63B0' : 'rgba(13,27,62,0.5)' }}>
                  {section.label}
                </span>
                <span className="text-[9px] transition-transform duration-200"
                  style={{ color: 'rgba(13,27,62,0.4)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
              </button>
              <div className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{ maxHeight: isOpen ? `${section.items.length * 40 + 8}px` : '0px' }}>
                <div className="py-1">
                  {section.items.map(item => (
                    <NavLink key={item.id} item={item} active={isActive(item.href)} onClick={() => setOpenSection(section.id)} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(13,27,62,0.08)' }}>
        <div className="w-7 h-7 rounded-full text-[11px] font-semibold flex-shrink-0 flex items-center justify-center"
          style={{ background: '#1D63B0', color: '#fff' }}>{(user?.name || user?.email || 'M')[0].toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] truncate" style={{ color: 'rgba(13,27,62,0.75)' }}>{user?.name || user?.email || 'MPX Admin'}</p>
          <p className="text-[10px]" style={{ color: 'rgba(13,27,62,0.4)' }}>{(user?.roles?.[0] || 'member')}</p>
        </div>
        {authEnabled && authenticated && (
          <a href="/api/auth/logout" title="ออกจากระบบ" aria-label="ออกจากระบบ"
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </a>
        )}
      </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, onClick }: { item: NavItemDef; active: boolean; onClick: () => void }) {
  const cls = `sidebar-link ${active ? 'active' : ''} w-full flex items-center gap-2.5 pl-4 pr-2 py-2 text-xs text-left rounded-lg`
  const inner = (
    <>
      <span className="text-[11px] flex-shrink-0 w-4 text-center leading-none">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </>
  )
  if (/^https?:\/\//.test(item.href)) {
    return <a href={item.href} target="_blank" rel="noreferrer" onClick={onClick} className={cls}>{inner}</a>
  }
  return <Link href={item.href} onClick={onClick} className={cls}>{inner}</Link>
}
