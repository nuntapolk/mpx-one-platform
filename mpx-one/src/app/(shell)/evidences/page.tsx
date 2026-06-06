'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import type { Evidence } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  accepted: { bg: '#F0FDF4', color: '#166534' },
  submitted: { bg: '#EFF6FF', color: '#1E40AF' },
  draft:    { bg: '#F9FAFB', color: '#6B7280' },
  rejected: { bg: '#FEF2F2', color: '#991B1B' },
  expired:  { bg: '#FFF7ED', color: '#C2410C' },
  archived: { bg: '#F9FAFB', color: '#9CA3AF' },
}

const TYPE_LABELS: Record<string, string> = {
  policy: 'Policy', procedure: 'Procedure', standard: 'Standard',
  guideline: 'Guideline', report: 'Report', screenshot: 'Screenshot',
  approval_record: 'Approval', meeting_minutes: 'Minutes', system_log: 'System Log',
  configuration: 'Config', contract: 'Contract', assessment_result: 'Assessment', other: 'Other',
}

const CONF_COLORS: Record<string, string> = {
  public: 'text-green-600', internal: 'text-blue-600',
  confidential: 'text-amber-600', restricted: 'text-red-600',
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function EvidencesPage() {
  const listKey   = `${API}/api/v1/evidences`
  const alertKey  = `${API}/api/v1/evidences/alerts/expiry`

  const { data: evidences, isLoading } = useSWR<Evidence[]>(listKey, fetcher)
  const { data: expiring } = useSWR<Evidence[]>(alertKey, fetcher)

  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'policy', description: '', external_link: '', confidentiality_level: 'internal' })

  const total    = evidences?.length ?? 0
  const accepted = evidences?.filter(e => e.status === 'accepted').length ?? 0
  const pending  = evidences?.filter(e => ['submitted', 'draft'].includes(e.status)).length ?? 0
  const rejected = evidences?.filter(e => e.status === 'rejected').length ?? 0

  const filtered = evidences?.filter(e => statusFilter === 'all' || e.status === statusFilter) ?? []

  async function createEvidence() {
    const count = evidences?.length ?? 0
    const year  = new Date().getFullYear()
    const evidence_id = `EVD-${year}-${String(count + 1).padStart(3, '0')}`
    await fetch(listKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, evidence_id, version: '1.0', status: 'draft' }),
    })
    mutate(listKey)
    setShowForm(false)
    setForm({ name: '', type: 'policy', description: '', external_link: '', confidentiality_level: 'internal' })
  }

  async function doReview(id: string, action: 'accept' | 'reject') {
    await fetch(`${API}/api/v1/evidences/${id}/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    })
    mutate(listKey)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Evidence ทั้งหมด" value={total} />
        <KPICard label="Accepted"         value={accepted} subVariant="up" />
        <KPICard label="Pending Review"   value={pending} subVariant="warn" />
        <KPICard label="Expiring (30d)"   value={expiring?.length ?? '—'} subVariant="danger" />
      </div>

      {/* Expiry alert */}
      {expiring && expiring.length > 0 && (
        <Card>
          <SectionHeader title={`⚠ Evidence ที่กำลังหมดอายุ (${expiring.length})`} />
          <div className="space-y-1">
            {expiring.map(e => {
              const days = daysUntil(e.expiry_date)
              return (
                <div key={e.id} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-400 mr-2">{e.evidence_id}</span>
                    <span className="text-zinc-700">{e.name}</span>
                  </div>
                  <span className={`font-medium ${days !== null && days < 0 ? 'text-red-600' : days !== null && days < 14 ? 'text-amber-600' : 'text-zinc-500'}`}>
                    {days !== null && days < 0 ? `หมดอายุแล้ว ${Math.abs(days)} วัน` : `เหลือ ${days} วัน`}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader title="Evidence Repository" action={
          <div className="flex gap-2">
            <div className="flex gap-1">
              {['all', 'accepted', 'submitted', 'draft', 'rejected', 'expired'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-[10px] px-2 py-1 rounded-full ${statusFilter === s ? 'text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                  style={statusFilter === s ? { background: '#02C39A' } : {}}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setShowForm(v => !v)}
              className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
              + เพิ่ม Evidence
            </button>
          </div>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อ Evidence *" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value }))}
                className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={form.confidentiality_level} onChange={e => setForm(v => ({ ...v, confidentiality_level: e.target.value }))}
                className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {['public', 'internal', 'confidential', 'restricted'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <input placeholder="External Link (URL)" value={form.external_link} onChange={e => setForm(v => ({ ...v, external_link: e.target.value }))}
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <textarea placeholder="คำอธิบาย" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
              rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <div className="flex gap-2">
              <button onClick={createEvidence} className="text-xs px-3 py-1.5 rounded text-white" style={{ background: '#02C39A' }}>บันทึก</button>
              <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded text-zinc-600 bg-zinc-100">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : filtered.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Evidence ID</Th>
                  <Th>ชื่อ</Th>
                  <Th>Type</Th>
                  <Th>Version</Th>
                  <Th>Confidentiality</Th>
                  <Th>วันหมดอายุ</Th>
                  <Th>Status</Th>
                  <Th>&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const st    = STATUS_STYLE[e.status] ?? { bg: '#f9f9f9', color: '#666' }
                  const days  = daysUntil(e.expiry_date)
                  const expWarn = days !== null && days < 30
                  return (
                    <tr key={e.id} className="hover:bg-zinc-50">
                      <Td><span className="font-mono text-[10px] text-zinc-400">{e.evidence_id}</span></Td>
                      <Td>
                        <p className="font-medium text-zinc-800">{e.name}</p>
                        {e.description && <p className="text-[10px] text-zinc-400 truncate max-w-xs">{e.description}</p>}
                      </Td>
                      <Td><span className="text-[10px] text-zinc-600">{TYPE_LABELS[e.type] ?? e.type}</span></Td>
                      <Td><span className="text-xs font-mono text-zinc-500">v{e.version}</span></Td>
                      <Td>
                        <span className={`text-[10px] font-medium capitalize ${CONF_COLORS[e.confidentiality_level] ?? 'text-zinc-600'}`}>
                          {e.confidentiality_level}
                        </span>
                      </Td>
                      <Td>
                        <span className={`text-xs ${expWarn ? 'text-amber-600 font-medium' : 'text-zinc-500'}`}>
                          {e.expiry_date ? new Date(e.expiry_date).toLocaleDateString('th-TH') : '—'}
                          {expWarn && days !== null && <span className="ml-1 text-[10px]">({days}d)</span>}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: st.bg, color: st.color }}>
                          {e.status}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {e.status === 'submitted' && (
                            <>
                              <button onClick={() => doReview(e.id, 'accept')} className="text-[10px] px-2 py-0.5 rounded text-white bg-emerald-600">Accept</button>
                              <button onClick={() => doReview(e.id, 'reject')} className="text-[10px] px-2 py-0.5 rounded text-white bg-red-500">Reject</button>
                            </>
                          )}
                          {e.external_link && (
                            <a href={e.external_link} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 text-blue-600 hover:border-blue-300">Link</a>
                          )}
                        </div>
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
