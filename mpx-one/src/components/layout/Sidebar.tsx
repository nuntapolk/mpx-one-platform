'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types'

const SECTIONS: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: 'overview', label: 'OVERVIEW', items: [
      { id: 'dashboard', label: 'Dashboard', icon: '▦', href: '/dashboard' },
    ],
  },
  {
    id: 'inventory', label: 'SHARED INVENTORY', items: [
      { id: 'inv-app',    label: 'Applications', icon: '▢', href: '/inventory/applications' },
      { id: 'inv-data',   label: 'Data Assets',  icon: '◫', href: '/inventory/data-assets' },
      { id: 'inv-ropa',   label: 'ROPA',         icon: '⊡', href: '/inventory/ropa' },
      { id: 'inv-vendor', label: 'Vendors',      icon: '⬢', href: '/inventory/vendors' },
      { id: 'inv-proj',   label: 'Projects',     icon: '◇', href: '/inventory/projects' },
      { id: 'inv-ai',     label: 'AI Use Cases', icon: '◈', href: '/inventory/ai-use-cases' },
    ],
  },
  {
    id: 'pdpa', label: 'PDPA GOVERNANCE', items: [
      { id: 'pdpa-consent', label: 'Consent',       icon: '✍', href: '/pdpa/consent' },
      { id: 'pdpa-dsar',    label: 'Rights (DSAR)', icon: '⚖', href: '/pdpa/dsar' },
      { id: 'pdpa-breach',  label: 'Breach',        icon: '⚡', href: '/pdpa/breach' },
      { id: 'pdpa-privacy', label: 'Privacy Notice',icon: '§', href: '/pdpa/privacy' },
    ],
  },
  {
    id: 'governance', label: 'GOVERNANCE', items: [
      { id: 'data',   label: 'Data governance', icon: '⊙', href: '/governance/data' },
      { id: 'it',     label: 'IT governance',   icon: '⬡', href: '/governance/it' },
      { id: 'ai',     label: 'AI governance',   icon: '◈', href: '/governance/ai' },
      { id: 'risk',   label: 'IT risk mgmt',    icon: '⚠', href: '/governance/risk' },
      { id: 'regmap', label: 'Reg. mapping',    icon: '⊞', href: '/governance/reg-map' },
    ],
  },
  {
    id: 'assessment', label: 'ASSESSMENT', items: [
      { id: 'assessments', label: 'Assessments',       icon: '✓', href: '/assessments' },
      { id: 'issues',      label: 'Issues & Findings', icon: '⚑', href: '/issues' },
      { id: 'evidences',   label: 'Evidence Repo',     icon: '📎', href: '/evidences' },
      { id: 'oic',         label: 'OIC Readiness',     icon: '◎', href: '/oic' },
      { id: 'controls',    label: 'Control Library',   icon: '⊟', href: '/controls' },
      { id: 'frameworks',  label: 'Frameworks',        icon: '≡', href: '/frameworks' },
    ],
  },
  {
    id: 'platform', label: 'PLATFORM', items: [
      { id: 'import-export', label: 'Import / Export', icon: '⇅', href: '/import-export' },
      { id: 'admin',         label: 'Admin Config',    icon: '⚒', href: '/admin' },
      { id: 'audit-trail',   label: 'Audit Trail',     icon: '◉', href: '/audit-trail' },
      { id: 'settings',      label: 'Settings',        icon: '⚙', href: '/settings' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  // null = all collapsed (default on start)
  const [openSection, setOpenSection] = useState<string | null>(null)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const toggle = (id: string) => setOpenSection(prev => (prev === id ? null : id))

  return (
    <aside className="w-[210px] flex-shrink-0 flex flex-col" style={{ background: '#0D1B3E' }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-[15px] font-semibold tracking-wide" style={{ color: '#02C39A' }}>MPX-ONE</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Governance Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map(section => {
          const isOpen = openSection === section.id
          const hasActiveChild = section.items.some(i => isActive(i.href))
          return (
            <div key={section.id} className="px-2">
              {/* Section header (collapsible) */}
              <button
                onClick={() => toggle(section.id)}
                className="sidebar-section w-full flex items-center justify-between px-2 py-2 rounded-lg"
                style={{ background: isOpen ? 'rgba(255,255,255,0.04)' : 'transparent' }}
              >
                <span
                  className="text-[10px] tracking-widest font-medium"
                  style={{ color: isOpen || hasActiveChild ? '#02C39A' : 'rgba(255,255,255,0.4)' }}
                >
                  {section.label}
                </span>
                <span
                  className="text-[9px] transition-transform duration-200"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  ▶
                </span>
              </button>

              {/* Items (collapsible body) */}
              <div
                className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{ maxHeight: isOpen ? `${section.items.length * 40 + 8}px` : '0px' }}
              >
                <div className="py-1">
                  {section.items.map(item => (
                    <NavLink
                      key={item.id}
                      item={item}
                      active={isActive(item.href)}
                      onClick={() => setOpenSection(section.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* User stub */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full text-[11px] font-medium flex-shrink-0 flex items-center justify-center"
          style={{ background: '#1D9E75', color: '#E1F5EE' }}>M</div>
        <div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>MPX Admin</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>admin · MPX-ONE</p>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`sidebar-link ${active ? 'active' : ''} w-full flex items-center gap-2.5 pl-4 pr-2 py-2 text-xs text-left rounded-lg`}
    >
      <span className="text-sm flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  )
}
