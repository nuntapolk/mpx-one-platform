export interface NavItemDef { id: string; label: string; icon: string; href: string }
export interface NavSectionDef { id: string; label: string; items: NavItemDef[] }

// Single source of truth for sidebar nav — shared by Sidebar + role permission matrix.
export const SECTIONS: NavSectionDef[] = [
  // 1. HOME
  { id: 'overview', label: 'HOME', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
  ]},
  // 2. SHARED INVENTORY
  { id: 'inventory', label: 'SHARED INVENTORY', items: [
    { id: 'inv-app',    label: 'Applications', icon: '🖥', href: '/inventory/applications' },
    { id: 'inv-ropa',   label: 'ROPA',         icon: '📋', href: '/inventory/ropa' },
    { id: 'inv-vendor', label: 'Vendors',      icon: '🏢', href: '/inventory/vendors' },
    { id: 'inv-proj',   label: 'Projects',     icon: '📁', href: '/inventory/projects' },
    { id: 'inv-ai',     label: 'AI Use Cases', icon: '🤖', href: '/inventory/ai-use-cases' },
  ]},
  // 3. IT RISK MANAGEMENT
  { id: 'itrisk', label: 'IT RISK MANAGEMENT', items: [
    { id: 'risk',   label: 'IT risk mgmt',    icon: '🛡️', href: '/governance/risk' },
    { id: 'issues', label: 'Issues & Findings', icon: '⚑', href: '/issues' },
  ]},
  // 4. EA PORTFOLIO
  { id: 'ea', label: 'EA PORTFOLIO', items: [
    { id: 'ea-cap', label: 'EA Capabilities', icon: '🏛', href: '/ea/capabilities' },
    { id: 'ea-arb', label: 'Architecture Review', icon: '⚖', href: '/ea/arb' },
  ]},
  // 5. IT GOVERNANCE
  { id: 'itgov', label: 'IT GOVERNANCE', items: [
    { id: 'it', label: 'IT governance', icon: '⚙️', href: '/governance/it' },
  ]},
  // 6. DATA GOVERNANCE
  { id: 'datagov', label: 'DATA GOVERNANCE', items: [
    { id: 'data',     label: 'Data governance', icon: '🛢', href: '/governance/data' },
    { id: 'inv-data', label: 'Data Assets',     icon: '🗄', href: '/inventory/data-assets' },
  ]},
  // PDPA (kept separate, grouped with data)
  { id: 'pdpa', label: 'PDPA GOVERNANCE', items: [
    { id: 'pdpa-consent', label: 'Consent',       icon: '✍', href: '/pdpa/consent' },
    { id: 'pdpa-dsar',    label: 'Rights (DSAR)', icon: '⚖', href: '/pdpa/dsar' },
    { id: 'pdpa-breach',  label: 'Breach',        icon: '⚡', href: '/pdpa/breach' },
    { id: 'pdpa-privacy', label: 'Privacy Notice',icon: '§', href: '/pdpa/privacy' },
    { id: 'pdpa-dpia',    label: 'DPIA',          icon: '◑', href: '/pdpa/dpia' },
    { id: 'pdpa-cookie',  label: 'Cookie Consent',icon: '◕', href: '/pdpa/cookie' },
    { id: 'pdpa-dpo',     label: 'DPO Tasks',     icon: '☑', href: '/pdpa/dpo' },
    { id: 'pdpa-train',   label: 'Training',      icon: '🎓', href: '/pdpa/training' },
    { id: 'pdpa-party',   label: 'External Parties', icon: '⇄', href: '/pdpa/external-parties' },
    { id: 'pdpa-camp',    label: 'ROPA Campaigns',icon: '📣', href: '/pdpa/campaigns' },
    { id: 'pdpa-datamap', label: 'Data Map',      icon: '🗺', href: '/pdpa/data-map' },
    { id: 'pdpa-access',  label: 'Access Review', icon: '🔑', href: '/pdpa/access-review' },
    { id: 'pdpa-workflow',label: 'Workflow',      icon: '🔀', href: '/pdpa/workflow' },
    { id: 'pdpa-master',  label: 'Master Data',   icon: '⚙', href: '/pdpa/master-data' },
  ]},
  // 7. AI GOVERNANCE
  { id: 'aigov', label: 'AI GOVERNANCE', items: [
    { id: 'ai-assessment', label: 'AI Assessment', icon: '🤖', href: '/ai-governance/assessment' },
    { id: 'ai',            label: 'AI governance', icon: '🧠', href: '/governance/ai' },
  ]},
  // 8. GOVERNANCE
  { id: 'governance', label: 'GOVERNANCE', items: [
    { id: 'regmap', label: 'Reg. mapping', icon: '📜', href: '/governance/reg-map' },
  ]},
  // 9. ASSESSMENT
  { id: 'assessment', label: 'ASSESSMENT', items: [
    { id: 'assessments', label: 'Assessments',       icon: '✓', href: '/assessments' },
    { id: 'evidences',   label: 'Evidence Repo',     icon: '📎', href: '/evidences' },
    { id: 'oic',         label: 'OIC Readiness',     icon: '◎', href: '/oic' },
    { id: 'controls',    label: 'Control Library',   icon: '⊟', href: '/controls' },
    { id: 'frameworks',  label: 'Frameworks',        icon: '≡', href: '/frameworks' },
    { id: 'pdpa-reports', label: 'Reports',          icon: '📈', href: '/pdpa/reports' },
  ]},
  // 10. CONFIGURATION
  { id: 'platform', label: 'CONFIGURATION', items: [
    { id: 'import-export', label: 'Import / Export', icon: '⇅', href: '/import-export' },
    { id: 'accounts',      label: 'Account Mgmt',    icon: '👤', href: '/accounts' },
    { id: 'admin',         label: 'Admin Config',    icon: '⚒', href: '/admin' },
    { id: 'audit-trail',   label: 'Audit Trail',     icon: '◉', href: '/audit-trail' },
    { id: 'access-logs',   label: 'Access Logs',     icon: '🔍', href: '/access-logs' },
    { id: 'settings',      label: 'Settings',        icon: '⚙', href: '/settings' },
    { id: 'api-docs',      label: 'API Docs',        icon: '📘', href: 'http://localhost:4000/api/docs' },
  ]},
]

export type AccessLevel = 'none' | 'view' | 'add' | 'full'
export const ACCESS_LEVELS: { value: AccessLevel; label: string; color: string }[] = [
  { value: 'none', label: 'ไม่มีสิทธิ์', color: '#c0272d' },
  { value: 'view', label: 'ดูอย่างเดียว', color: '#0369a1' },
  { value: 'add',  label: 'เพิ่มข้อมูล', color: '#d97706' },
  { value: 'full', label: 'จัดการเต็ม', color: '#15803d' },
]
const RANK: Record<AccessLevel, number> = { none: 0, view: 1, add: 2, full: 3 }

// Resolve a role's access level for a nav item ('*' wildcard = applies to all).
export function accessFor(permissions: Record<string, AccessLevel> | undefined, navId: string): AccessLevel {
  if (!permissions) return 'none'
  if (permissions[navId]) return permissions[navId]
  if (permissions['*']) return permissions['*']
  return 'none'
}

// Effective (max) access across multiple roles.
export function effectiveAccess(roles: { permissions?: Record<string, AccessLevel> }[], navId: string): AccessLevel {
  let best: AccessLevel = 'none'
  for (const r of roles) { const a = accessFor(r.permissions, navId); if (RANK[a] > RANK[best]) best = a }
  return best
}
