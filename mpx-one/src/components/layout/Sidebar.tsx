'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { SECTIONS, effectiveAccess, type NavItemDef } from '@/lib/nav'
import { useAuthStore } from '@/store/auth'
import { APP_VERSION } from '@/lib/version'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : [])

export default function Sidebar() {
  const pathname = usePathname()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const { user, authEnabled, authenticated } = useAuthStore()
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
    <aside className="w-[210px] flex-shrink-0 flex flex-col" style={{ background: '#0D1B3E' }}>
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-[15px] font-semibold tracking-wide" style={{ color: '#02C39A' }}>MPX-ONE</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Governance Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map(section => {
          const isOpen = openSection === section.id
          const hasActiveChild = section.items.some(i => isActive(i.href))
          return (
            <div key={section.id} className="px-2">
              <button
                onClick={() => toggle(section.id)}
                className="sidebar-section w-full flex items-center justify-between px-2 py-2 rounded-lg"
                style={{ background: isOpen ? 'rgba(255,255,255,0.04)' : 'transparent' }}
              >
                <span className="text-[10px] tracking-widest font-medium"
                  style={{ color: isOpen || hasActiveChild ? '#02C39A' : 'rgba(255,255,255,0.4)' }}>
                  {section.label}
                </span>
                <span className="text-[9px] transition-transform duration-200"
                  style={{ color: 'rgba(255,255,255,0.4)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
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

      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        {authEnabled && authenticated && (
          <a href="/api/auth/logout" title="ออกจากระบบ" aria-label="ออกจากระบบ"
            className="sidebar-logout flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </a>
        )}
        <div className="w-7 h-7 rounded-full text-[11px] font-medium flex-shrink-0 flex items-center justify-center"
          style={{ background: '#1D9E75', color: '#E1F5EE' }}>{(user?.name || user?.email || 'M')[0].toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.name || user?.email || 'MPX Admin'}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{(user?.roles?.[0] || 'member')} · v{APP_VERSION.full}</p>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, onClick }: { item: NavItemDef; active: boolean; onClick: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}
      className={`sidebar-link ${active ? 'active' : ''} w-full flex items-center gap-2.5 pl-4 pr-2 py-2 text-xs text-left rounded-lg`}>
      <span className="text-sm flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  )
}
