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
  const { user } = useAuthStore()
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
    <aside className="w-[210px] flex-shrink-0 flex flex-col" style={{ background: 'linear-gradient(180deg, #f3f8fd 0%, #dfeaf7 100%)', borderRight: '1px solid rgba(13,27,62,0.08)' }}>
      <div className="px-4 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(13,27,62,0.08)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mpx-one-logo-small.png" alt="MPX-ONE" className="h-16 w-16 object-contain flex-shrink-0" />
        <p className="text-[22px] italic font-bold tracking-[0.03em] bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-brand), system-ui, sans-serif', backgroundImage: 'linear-gradient(95deg, #0D1B3E 0%, #1D63B0 55%, #02C39A 100%)' }}>MPX-ONE</p>
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
          <p className="text-[10px]" style={{ color: 'rgba(13,27,62,0.4)' }}>{(user?.roles?.[0] || 'member')} · v{APP_VERSION.full}</p>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, onClick }: { item: NavItemDef; active: boolean; onClick: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}
      className={`sidebar-link ${active ? 'active' : ''} w-full flex items-center gap-2.5 pl-4 pr-2 py-2 text-xs text-left rounded-lg`}>
      <span className="text-[11px] flex-shrink-0 w-4 text-center leading-none">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  )
}
