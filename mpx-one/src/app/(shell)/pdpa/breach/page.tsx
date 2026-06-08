'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const SEV: Record<string, { bg: string; c: string }> = {
  critical: { bg: '#FEF2F2', c: '#B91C1C' }, high: { bg: '#FFFBEB', c: '#D97706' },
  medium: { bg: '#F0F9FF', c: '#0369A1' }, low: { bg: '#F0FDF4', c: '#166534' },
}
const STATUS_LABEL: Record<string, string> = {
  reported: 'รายงานแล้ว', investigating: 'กำลังสืบสวน', contained: 'ควบคุมแล้ว',
  notified: 'แจ้งแล้ว', resolved: 'แก้ไขแล้ว', closed: 'ปิด',
}
const PDPC: Record<string, { bg: string; c: string; label: string }> = {
  on_track:     { bg: '#F0FDF4', c: '#166534', label: 'ตามกำหนด' },
  critical:     { bg: '#FFF7ED', c: '#C2410C', label: 'เร่งด่วน' },
  overdue:      { bg: '#FEF2F2', c: '#991B1B', label: 'เกิน 72 ชม.' },
  notified:     { bg: '#EFF6FF', c: '#1E40AF', label: 'แจ้งแล้ว' },
  not_required: { bg: '#F4F4F5', c: '#A1A1AA', label: 'ไม่ต้องแจ้ง' },
  pending:      { bg: '#F4F4F5', c: '#71717A', label: 'รอ' },
}

export default function BreachPage() {
  const statsKey = `${API}/api/v1/breach/stats`
  const listKey  = `${API}/api/v1/breach`
  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: list } = useSWR(listKey, fetcher)
  const rows = Array.isArray(list) ? list : []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', breach_type: 'confidentiality', severity: 'medium', affected_count: 0, requires_pdpc_notification: true, description: '' })

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey)
    setShowForm(false)
    setForm({ title: '', breach_type: 'confidentiality', severity: 'medium', affected_count: 0, requires_pdpc_notification: true, description: '' })
  }
  async function notifyPdpc(id: string) {
    const ref = prompt('เลขอ้างอิงการแจ้ง PDPC:')
    if (ref === null) return
    await fetch(`${API}/api/v1/breach/${id}/notify-pdpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: ref || 'N/A' }) })
    mutate(listKey); mutate(statsKey)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="เหตุละเมิดทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="เปิดอยู่" value={stats?.open ?? '—'} subVariant="warn" />
        <KPICard label="PDPC เกิน 72 ชม." value={stats?.pdpc_overdue ?? '—'} subVariant="danger" />
        <KPICard label="PDPC เร่งด่วน" value={stats?.pdpc_critical ?? '—'} subVariant="danger" />
        <KPICard label="รอแจ้ง PDPC" value={stats?.awaiting_notify ?? '—'} subVariant="warn" />
      </div>

      <Card>
        <SectionHeader title="Personal Data Breach Incidents" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-danger text-xs px-3 py-1.5 rounded-lg">+ รายงานเหตุละเมิด</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="หัวข้อเหตุการณ์ *" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <div className="grid grid-cols-3 gap-2">
              <select value={form.breach_type} onChange={e => setForm(v => ({ ...v, breach_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {['confidentiality','integrity','availability','mixed'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={form.severity} onChange={e => setForm(v => ({ ...v, severity: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" placeholder="จำนวนผู้กระทบ" value={form.affected_count} onChange={e => setForm(v => ({ ...v, affected_count: +e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input type="checkbox" checked={form.requires_pdpc_notification} onChange={e => setForm(v => ({ ...v, requires_pdpc_notification: e.target.checked }))} />
              ต้องแจ้ง PDPC (เริ่มนับ 72 ชั่วโมงจากเวลาที่พบ)
            </label>
            <textarea placeholder="รายละเอียด" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-danger text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {rows.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead><tr>
              <Th>Incident</Th><Th>หัวข้อ</Th><Th>Severity</Th><Th>กระทบ</Th>
              <Th>สถานะ</Th><Th>PDPC 72ชม.</Th><Th>&nbsp;</Th>
            </tr></thead>
            <tbody>
              {rows.map((b: any) => {
                const sev = SEV[b.severity] ?? SEV.medium
                const p = PDPC[b.pdpc?.state] ?? PDPC.pending
                const hrs = b.pdpc?.hours_left
                return (
                  <tr key={b.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{b.incident_number}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{b.title}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sev.bg, color: sev.c }}>{b.severity}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{b.affected_count ?? '—'}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{STATUS_LABEL[b.status] ?? b.status}</span></Td>
                    <Td>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: p.bg, color: p.c }}>
                        {p.label}{hrs != null && b.pdpc?.state !== 'notified' && b.pdpc?.state !== 'not_required' ? ` (${hrs}ชม.)` : ''}
                      </span>
                    </Td>
                    <Td>{b.requires_pdpc_notification && !b.pdpc_notified_at && (
                      <button onClick={() => notifyPdpc(b.id)} className="glass-btn-primary text-[10px] px-2 py-0.5 rounded">แจ้ง PDPC</button>
                    )}</Td>
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
