'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/governance/data':        'Data Governance',
  '/governance/it':          'IT Governance',
  '/governance/ai':          'AI Governance',
  '/governance/risk':        'IT Risk Management',
  '/governance/reg-map':     'Regulatory Mapping',
  '/assessments':            'Assessments',
  '/issues':                 'Issues & Findings',
  '/assessments/templates':  'Assessment Templates',
  '/controls':               'Control Library',
  '/frameworks':             'Frameworks',
  '/settings':               'Settings',
}

export default function Topbar() {
  const pathname = usePathname()
  // Match dynamic routes
  const title = PAGE_TITLES[pathname]
    ?? (pathname.startsWith('/assessments/') ? 'Assessment Detail' : 'MPX-ONE')

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
      <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">MPX-ONE v1.0</span>
        <div
          className="w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center"
          style={{ background: '#0D1B3E', color: '#02C39A' }}
        >
          M
        </div>
      </div>
    </header>
  )
}
