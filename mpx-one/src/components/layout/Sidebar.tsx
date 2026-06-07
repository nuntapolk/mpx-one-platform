'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types'

const NAV_OVERVIEW: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', href: '/dashboard' },
]

const NAV_INVENTORY: NavItem[] = [
  { id: 'inv-app',    label: 'Applications',   icon: '▢', href: '/inventory/applications' },
  { id: 'inv-data',   label: 'Data Assets',    icon: '◫', href: '/inventory/data-assets' },
  { id: 'inv-ropa',   label: 'ROPA',           icon: '⊡', href: '/inventory/ropa' },
  { id: 'inv-vendor', label: 'Vendors',        icon: '⬢', href: '/inventory/vendors' },
  { id: 'inv-proj',   label: 'Projects',       icon: '◇', href: '/inventory/projects' },
  { id: 'inv-ai',     label: 'AI Use Cases',   icon: '◈', href: '/inventory/ai-use-cases' },
]

const NAV_GOVERNANCE: NavItem[] = [
  { id: 'data',        label: 'Data governance',  icon: '⊙', href: '/governance/data' },
  { id: 'it',          label: 'IT governance',    icon: '⬡', href: '/governance/it' },
  { id: 'ai',          label: 'AI governance',    icon: '◈', href: '/governance/ai' },
  { id: 'risk',        label: 'IT risk mgmt',     icon: '⚠', href: '/governance/risk' },
  { id: 'regmap',      label: 'Reg. mapping',     icon: '⊞', href: '/governance/reg-map' },
]

const NAV_ASSESSMENT: NavItem[] = [
  { id: 'assessments', label: 'Assessments',       icon: '✓', href: '/assessments' },
  { id: 'issues',      label: 'Issues & Findings', icon: '⚑', href: '/issues' },
  { id: 'evidences',   label: 'Evidence Repo',     icon: '📎', href: '/evidences' },
  { id: 'oic',         label: 'OIC Readiness',     icon: '◎', href: '/oic' },
  { id: 'controls',    label: 'Control Library',   icon: '⊟', href: '/controls' },
  { id: 'frameworks',  label: 'Frameworks',        icon: '≡', href: '/frameworks' },
]

const NAV_PLATFORM: NavItem[] = [
  { id: 'import-export', label: 'Import / Export', icon: '⇅', href: '/import-export' },
  { id: 'audit-trail',   label: 'Audit Trail',     icon: '◉', href: '/audit-trail' },
  { id: 'settings',      label: 'Settings',        icon: '⚙', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-[200px] flex-shrink-0 flex flex-col" style={{ background: '#0D1B3E' }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-[15px] font-semibold tracking-wide" style={{ color: '#02C39A' }}>
          MPX-ONE
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Governance Platform
        </p>
      </div>

      <SidebarSection label="OVERVIEW">
        {NAV_OVERVIEW.map(item => <NavLink key={item.id} item={item} active={isActive(item.href)} />)}
      </SidebarSection>

      <SidebarSection label="SHARED INVENTORY">
        {NAV_INVENTORY.map(item => <NavLink key={item.id} item={item} active={isActive(item.href)} />)}
      </SidebarSection>

      <SidebarSection label="GOVERNANCE">
        {NAV_GOVERNANCE.map(item => <NavLink key={item.id} item={item} active={isActive(item.href)} />)}
      </SidebarSection>

      <SidebarSection label="ASSESSMENT">
        {NAV_ASSESSMENT.map(item => <NavLink key={item.id} item={item} active={isActive(item.href)} />)}
      </SidebarSection>

      <SidebarSection label="PLATFORM">
        {NAV_PLATFORM.map(item => <NavLink key={item.id} item={item} active={isActive(item.href)} />)}
      </SidebarSection>

      {/* User stub */}
      <div className="mt-auto px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full text-[11px] font-medium flex-shrink-0 flex items-center justify-center"
          style={{ background: '#1D9E75', color: '#E1F5EE' }}
        >
          M
        </div>
        <div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>MPX Admin</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>admin · MPX-ONE</p>
        </div>
      </div>
    </aside>
  )
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="px-4 py-1 text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const badgeStyle = {
    success: { background: 'rgba(2,195,154,0.15)',   color: '#02C39A' },
    warning: { background: 'rgba(239,159,39,0.15)',  color: '#EF9F27' },
    danger:  { background: 'rgba(226,75,74,0.15)',   color: '#E24B4A' },
  }[item.badge?.variant ?? 'success']

  return (
    <Link
      href={item.href}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-all"
      style={{
        color:      active ? '#02C39A' : 'rgba(255,255,255,0.55)',
        background: active ? 'rgba(2,195,154,0.08)' : 'transparent',
        borderLeft: active ? '2px solid #02C39A' : '2px solid transparent',
      }}
    >
      <span className="text-sm flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={badgeStyle}>
          {item.badge.value}
        </span>
      )}
    </Link>
  )
}
