'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import type { Issue } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const SEV_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#FEF2F2', text: '#B91C1C' },
  high:     { bg: '#FFFBEB', text: '#D97706' },
  medium:   { bg: '#FFFFF0', text: '#92400E' },
  low:      { bg: '#F0FDF4', text: '#166534' },
}

const STATUS_STYLE: Record<string, string> = {
  open:           'text-red-600',
  in_progress:    'text-amber-600',
  pending_review: 'text-purple-600',
  resolved:       'text-blue-600',
  closed:         'text-zinc-400',
  accepted:       'text-zinc-400',
}

const TYPE_LABELS: Record<string, string> = {
  assessment_gap:       'Assessment Gap',
  audit_finding:        'Audit Finding',
  control_deficiency:   'Control Deficiency',
  policy_noncompliance: 'Policy Non-compliance',
  risk_treatment_issue: 'Risk Treatment Issue',
  evidence_missing:     'Evidence Missing',
  regulatory_gap:       'Regulatory Gap',
}

export default function IssuesPage() {
  const statsKey   = `${API}/api/v1/issues/stats`
  const listKey    = `${API}/api/v1/issues`
  const overdueKey = `${API}/api/v1/issues/action-plans/overdue`

  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: issues, isLoading } = useSWR<Issue[]>(listKey, fetcher)
  const { data: overdue } = useSWR<any[]>(overdueKey, fetcher)

  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ title: '', type: 'assessment_gap', severity: 'medium', description: '', corrective_action: '' })

  async function createIssue() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey)
    setShowForm(false)
    setForm({ title: '', type: 'assessment_gap', severity: 'medium', description: '', corrective_action: '' })
  }

  async function closeIssue(id: string) {
    await fetch(`${API}/api/v1/issues/${id}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: 'Closed' }) })
    mutate(listKey); mutate(statsKey)
  }

  const filtered = (Array.isArray(issues) ? issues : []).filter(i => filter === 'all' || i.status === filter)

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-6 gap-3">
        <KPICard label="ทั้งหมด"        value={stats?.total ?? '—'} />
        <KPICard label="Open"           value={stats?.open ?? '—'} subVariant="danger" />
        <KPICard label="In Progress"    value={stats?.in_progress ?? '—'} subVariant="warn" />
        <KPICard label="Pending Review" value={stats?.pending_review ?? '—'} subVariant="warn" />
        <KPICard label="Critical/High"  value={stats?.critical_open ?? '—'} subVariant="danger" />
        <KPICard label="Action Overdue" value={stats?.overdue_actions ?? '—'} subVariant="danger" />
      </div>

      {/* Overdue actions */}
      {overdue && overdue.length > 0 && (
        <Card>
          <SectionHeader title={`⚠ Overdue Action Plans (${overdue.length})`} />
          <div className="space-y-1">
            {overdue.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 mr-2">{a.action_id}</span>
                  <span className="text-zinc-700">{a.description}</span>
                </div>
                <span className="text-red-500 text-[11px]">{new Date(a.due_date).toLocaleDateString('th-TH')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Issues list */}
      <Card>
        <SectionHeader title="Issue & Finding Register" action={
          <div className="flex gap-2">
            <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
              {['all', 'open', 'in_progress', 'pending_review', 'closed'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-[10px] px-2 py-1 rounded-full transition-colors glass-tab ${filter === s ? 'active' : ''}`}>
                  {s === 'all' ? 'ทั้งหมด' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button onClick={() => setShowForm(v => !v)}
              className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">
              + เพิ่ม Issue
            </button>
          </div>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อ Issue *" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value }))}
                className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={form.severity} onChange={e => setForm(v => ({ ...v, severity: e.target.value }))}
                className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea placeholder="คำอธิบาย" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
              rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <textarea placeholder="Corrective Action" value={form.corrective_action} onChange={e => setForm(v => ({ ...v, corrective_action: e.target.value }))}
              rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <div className="flex gap-2">
              <button onClick={createIssue} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : filtered.length === 0 ? <Empty message="ไม่มี Issue ในสถานะนี้" />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Issue ID</Th>
                  <Th>ชื่อ Issue</Th>
                  <Th>Type</Th>
                  <Th>Severity</Th>
                  <Th>Status</Th>
                  <Th>วันกำหนด</Th>
                  <Th>&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const sev = SEV_STYLE[i.severity] ?? { bg: '#f9f9f9', text: '#666' }
                  return (
                    <tr key={i.id} className="hover:bg-zinc-50">
                      <Td><span className="font-mono text-[10px] text-zinc-400">{i.issue_id}</span></Td>
                      <Td>
                        <p className="font-medium text-zinc-800">{i.title}</p>
                        {i.description && <p className="text-[10px] text-zinc-400 truncate max-w-xs">{i.description}</p>}
                      </Td>
                      <Td><span className="text-[10px] text-zinc-600">{TYPE_LABELS[i.type] ?? i.type}</span></Td>
                      <Td>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: sev.bg, color: sev.text }}>
                          {i.severity}
                        </span>
                      </Td>
                      <Td>
                        <span className={`text-xs font-medium ${STATUS_STYLE[i.status] ?? 'text-zinc-600'}`}>
                          {i.status.replace('_', ' ')}
                        </span>
                      </Td>
                      <Td>{i.due_date ? new Date(i.due_date).toLocaleDateString('th-TH') : '—'}</Td>
                      <Td>
                        {['open', 'in_progress', 'pending_review'].includes(i.status) && (
                          <button onClick={() => closeIssue(i.id)}
                            className="glass-btn-emerald text-[10px] px-2 py-0.5 rounded">
                            Close
                          </button>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
