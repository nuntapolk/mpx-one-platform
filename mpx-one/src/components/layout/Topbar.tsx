'use client'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { APP_VERSION } from '@/lib/version'

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
        <span className="text-[10px] text-zinc-400 font-mono" title="App version · build number">v{APP_VERSION.full}</span>
        <UserMenu />
      </div>
    </header>
  )
}

function UserMenu() {
  const { user } = useAuthStore()
  const name = user?.name || user?.email || 'User'
  const initial = (name[0] || 'M').toUpperCase()
  return (
    <div className="flex items-center gap-2">
      <div className="text-right leading-tight hidden sm:block">
        <div className="text-[11px] text-zinc-700 font-medium">{name}</div>
        <div className="text-[9px] text-zinc-400">{user?.roles?.[0] || 'member'}</div>
      </div>
      <div className="w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center" style={{ background: '#0D1B3E', color: '#02C39A' }}>
        {initial}
      </div>
    </div>
  )
}
