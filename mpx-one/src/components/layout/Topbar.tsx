'use client'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

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
      <h1 className="text-sm font-medium text-zinc-900">{title}</h1>
      <div className="flex items-center gap-3">
        <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer"
          className="text-[10px] px-2 py-1 rounded border border-zinc-200 text-zinc-500 hover:border-[#02C39A] hover:text-[#02C39A] transition-colors">
          API Docs
        </a>
        <UserMenu />
      </div>
    </header>
  )
}

function UserMenu() {
  const { user, authEnabled, authenticated } = useAuthStore()
  const name = user?.name || user?.email || 'User'
  const initial = (name[0] || 'M').toUpperCase()
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center" style={{ background: '#0D1B3E', color: '#02C39A' }}>
        {initial}
      </div>
      {authEnabled && authenticated && (
        <a href="/api/auth/logout" title="ออกจากระบบ" aria-label="ออกจากระบบ"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </a>
      )}
    </div>
  )
}
