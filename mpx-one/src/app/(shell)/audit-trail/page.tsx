'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Card, SectionHeader, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const ACTION_STYLE: Record<string, string> = {
  create:  'bg-emerald-50 text-emerald-700',
  update:  'bg-blue-50    text-blue-700',
  delete:  'bg-red-50     text-red-700',
  approve: 'bg-purple-50  text-purple-700',
  reject:  'bg-red-50     text-red-700',
  submit:  'bg-amber-50   text-amber-700',
  close:   'bg-zinc-100   text-zinc-600',
}

const TYPE_ICONS: Record<string, string> = {
  framework: '≡', obligation: '◎', control: '⊟', control_mapping: '↔',
  assessment: '✓', risk: '⚠', issue: '⚑', evidence: '📄',
  action_plan: '→', user: '👤', role: '🔑',
}

export default function AuditTrailPage() {
  const [objectType, setObjectType] = useState('all')
  const url = objectType === 'all'
    ? `${API}/api/v1/audit-trail`
    : `${API}/api/v1/audit-trail?object_type=${objectType}`

  const { data: logs, isLoading } = useSWR(url, fetcher, { refreshInterval: 10000 })

  const types = ['all', 'framework', 'obligation', 'control', 'control_mapping', 'assessment', 'risk', 'issue', 'evidence', 'action_plan']

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Audit Trail" action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Auto-refresh 10s</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        } />

        {/* Object type filter */}
        <div className="flex flex-wrap gap-1 mb-4">
          {types.map(t => (
            <button key={t} onClick={() => setObjectType(t)}
              className={`text-[10px] px-2 py-1 rounded-full capitalize glass-tab ${objectType === t ? 'active' : ''}`}>
              {TYPE_ICONS[t] ? `${TYPE_ICONS[t]} ${t}` : t}
            </button>
          ))}
        </div>

        {isLoading ? <div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : !logs || logs.length === 0 ? <Empty message="ยังไม่มี Audit Trail — เริ่มใช้งานระบบเพื่อสร้าง log" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>เวลา</Th>
                  <Th>Action</Th>
                  <Th>Object Type</Th>
                  <Th>Object ID</Th>
                  <Th>User</Th>
                  <Th>Remark</Th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-zinc-50">
                    <Td>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(l.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </Td>
                    <Td>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ACTION_STYLE[l.action] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {l.action}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs capitalize">
                        {TYPE_ICONS[l.object_type] ? `${TYPE_ICONS[l.object_type]} ` : ''}{l.object_type?.replace('_', ' ')}
                      </span>
                    </Td>
                    <Td><span className="text-[10px] font-mono text-zinc-400 truncate max-w-xs block">{l.object_id?.slice(0, 8)}…</span></Td>
                    <Td><span className="text-xs text-zinc-600">{l.user_email ?? l.user_id ?? '—'}</span></Td>
                    <Td><span className="text-xs text-zinc-500">{l.remark ?? '—'}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
