'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              '🏠 Executive Dashboard',
  '/readiness':              '🛡️ PDPA Compliance & Readiness Score',
  '/governance/data':        'Data Governance',
  '/governance/it':          'IT Governance',
  '/governance/ai':          'AI Governance',
  '/governance/risk':        'Risk Management',
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
  '/ai-governance/assessment': 'AI Assessment',
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

export default function PageTitle() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname]
    ?? (pathname.startsWith('/inventory/ropa/') ? 'ROPA — 4-Phase Editor'
      : pathname.startsWith('/ai-governance/assessment/') ? 'AI Assessment Detail'
      : pathname.startsWith('/assessments/') ? 'Assessment Detail'
      : 'MPX-ONE Governance')
  return <h1 className="text-sm font-medium text-zinc-900 mb-3">{title}</h1>
}
