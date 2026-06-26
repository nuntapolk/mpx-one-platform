'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { SECTIONS, effectiveAccess, type NavItemDef } from '@/lib/nav'
import { useAuthStore } from '@/store/auth'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : [])

// Short horizontal-bar labels for each section (fallback to the section's own label).
const MENU_LABELS: Record<string, string> = {
  inventory: 'Inventory', itrisk: 'Risk', ea: 'EA', itgov: 'IT Gov',
  datagov: 'Data', pdpa: 'PDPA', aigov: 'AI Gov', assessment: 'Assessment', platform: 'Setting',
}

// Active/open highlight — light blue (30% opacity) with dark-blue text.
const ACTIVE_BG = 'rgba(29,99,176,0.3)'
const ACTIVE_TEXT = '#1D63B0'

export default function MenuBar() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { data: rolesData } = useSWR(`${API}/api/v1/roles`, fetcher)
  const barRef = useRef<HTMLDivElement>(null)

  // Reuse the existing role-permission model — identical to the old Sidebar.
  const allRoles: any[] = Array.isArray(rolesData) ? rolesData : []
  const myRoles = allRoles.filter(r => (user?.roles ?? []).includes(r.key))
  const filtering = allRoles.length > 0 && myRoles.length > 0
  const canSee = (navId: string) => !filtering || effectiveAccess(myRoles, navId) !== 'none'

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const sections = SECTIONS
    .map(s => ({ ...s, items: s.items.filter(i => canSee(i.id)) }))
    .filter(s => s.items.length > 0)

  // macOS behaviour: click outside closes, Esc closes.
  useEffect(() => {
    if (!openMenu) return
    const onDoc = (e: MouseEvent) => { if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(null) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [openMenu])

  return (
    <header
      ref={barRef}
      className="h-11 flex-shrink-0 flex items-center gap-0.5 px-3 relative z-20"
      style={{ background: 'rgba(243,248,253,0.85)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid rgba(13,27,62,0.08)' }}
    >
      {/* Logo → About/Dashboard */}
      <Link href="/dashboard" title="เกี่ยวกับ MPX-ONE" className="flex items-center mr-1.5 pr-2" style={{ borderRight: '1px solid rgba(13,27,62,0.1)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mpx-one-logo.png" alt="MPX-ONE" className="h-[26px] w-auto object-contain" />
      </Link>

      {/* About us — direct link, no dropdown */}
      <Link
        href="/dashboard"
        className="text-[13px] px-2.5 py-1 rounded-md transition-colors"
        style={{ color: isActive('/dashboard') ? ACTIVE_TEXT : 'rgba(13,27,62,0.7)', background: isActive('/dashboard') ? ACTIVE_BG : 'transparent' }}
      >
        About us
      </Link>

      {sections.map(section => {
        const isOpen = openMenu === section.id
        const hasActiveChild = section.items.some(i => isActive(i.href))
        return (
          <div key={section.id} className="relative">
            <button
              onClick={() => setOpenMenu(prev => (prev === section.id ? null : section.id))}
              onMouseEnter={() => { if (openMenu) setOpenMenu(section.id) }}
              className="text-[13px] px-2.5 py-1 rounded-md transition-colors"
              style={{
                color: isOpen || hasActiveChild ? ACTIVE_TEXT : 'rgba(13,27,62,0.7)',
                background: isOpen ? ACTIVE_BG : 'transparent',
              }}
            >
              {MENU_LABELS[section.id] ?? section.label}
            </button>
            {isOpen && (
              <div
                className="absolute left-0 top-full mt-1 min-w-[210px] p-1.5 rounded-xl z-30"
                style={{ background: 'rgba(255,255,255,0.98)', border: '0.5px solid rgba(13,27,62,0.15)', boxShadow: '0 8px 28px rgba(13,27,62,0.16)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
              >
                {section.items.map(item => (
                  <MenuItem key={item.id} item={item} active={isActive(item.href)} onClick={() => setOpenMenu(null)} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </header>
  )
}

function MenuItem({ item, active, onClick }: { item: NavItemDef; active: boolean; onClick: () => void }) {
  const cls = 'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-left transition-colors'
  const style = { color: active ? '#1D63B0' : 'rgba(13,27,62,0.82)', background: active ? 'rgba(29,99,176,0.1)' : 'transparent' }
  const inner = (
    <>
      <span className="text-[12px] flex-shrink-0 w-4 text-center leading-none">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {active && <span className="text-[11px] text-[#1D63B0]">✓</span>}
    </>
  )
  if (/^https?:\/\//.test(item.href)) {
    return <a href={item.href} target="_blank" rel="noreferrer" onClick={onClick} className={`menu-item ${cls}`} style={style}>{inner}</a>
  }
  return <Link href={item.href} onClick={onClick} className={`menu-item ${cls}`} style={style}>{inner}</Link>
}
