'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              '🏠 Executive Dashboard',
  '/governance/data':        'Data Governance',
  '/governance/it':          'IT Governance',
  '/governance/ai':          'AI Governance',
  '/governance/risk':        'IT Risk Management',
  '/governance/reg-map':     'Regulatory Mapping',
  '/inventory/applications':  'Application Portfolio',
  '/inventory/data-assets':   'Data Asset Registry',
  '/inventory/ropa':          'ROPA — Processing Records',
  '/inventory/vendors':       'Vendor Registry',
  '/inventory/projects':      'Project Portfolio',
  '/inventory/ai-use-cases':  'AI Use Case Registry',
  '/pdpa/consent':           'PDPA · Consent Management',
  '/pdpa/dsar':              'PDPA · Rights Requests (DSAR)',
  '/pdpa/breach':            'PDPA · Breach Incidents',
  '/pdpa/privacy':           'PDPA · Privacy Notice & Retention',
  '/pdpa/dpia':              'PDPA · Data Protection Impact Assessment',
  '/pdpa/cookie':            'PDPA · Cookie Consent',
  '/pdpa/dpo':               'PDPA · DPO Tasks',
  '/pdpa/training':          'PDPA · Training',
  '/pdpa/external-parties':  'PDPA · External Parties',
  '/pdpa/campaigns':         'PDPA · ROPA Campaigns',
  '/assessments':            'Assessments',
  '/assessments/templates':  'Assessment Templates',
  '/issues':                 'Issues & Findings',
  '/evidences':              'Evidence Repository',
  '/oic':                    'OIC Audit Readiness',
  '/controls':               'Control Library',
  '/frameworks':             'Framework Library',
  '/import-export':          'Import / Export',
  '/admin':                  'Admin Configuration',
  '/audit-trail':            'Audit Trail',
  '/settings':               'Settings',
}

export default function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname]
    ?? (pathname.startsWith('/inventory/ropa/') ? 'ROPA — 4-Phase Editor' : pathname.startsWith('/assessments/') ? 'Assessment Detail' : 'MPX-ONE Governance')

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-5" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.6)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="flex items-center gap-2.5">
        <SidebarToggle />
        <h1 className="text-sm font-medium text-zinc-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </header>
  )
}

function SidebarToggle() {
  const { sidebarHidden, toggleSidebar } = useUiStore()
  return (
    <button onClick={toggleSidebar} title={sidebarHidden ? 'แสดงเมนู' : 'ซ่อนเมนู'} aria-label="hide/show sidebar"
      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#1D63B0] hover:bg-[#1D63B0]/10 transition-colors">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    </button>
  )
}

function UserMenu() {
  const { user } = useAuthStore()
  const name = user?.name || user?.email || 'User'
  return (
    <div className="flex items-center gap-2">
      <Link href="/about" title={`เกี่ยวกับ MPX-ONE · ${name}`}>
        <img src="/mpx-logo-2.png" alt="MPX-ONE" className="h-7 w-auto object-contain" />
      </Link>
    </div>
  )
}
