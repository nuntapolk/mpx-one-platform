'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TYPES = ['new_app', 'change', 'exception', 'decommission', 'tech_selection']
const stColor = (s: string) => (({ submitted: ['#eff6ff', '#1d4ed8'], in_review: ['#f5f3ff', '#7c3aed'], approved: ['#dcfce7', '#15803d'], rejected: ['#fee2e2', '#c0272d'], conditional: ['#fef3c7', '#d97706'], deferred: ['#f1f5f9', '#64748b'] } as any)[s] || ['#f1f5f9', '#64748b'])
const riskColor = (r: string) => (({ low: '#15803d', medium: '#d97706', high: '#c0272d', critical: '#7f1d1d' } as any)[r] || '#64748b')

export default function Page() {
  const listKey = `${API}/api/v1/arb`
  const dashKey = `${API}/api/v1/arb/dashboard`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: dash } = useSWR(dashKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const blank = { title: '', request_type: 'change', risk_level: 'medium', description: '', requested_by: '' }
  const [form, setForm] = useState<any>(blank)

  function refresh() { mutate(listKey); mutate(dashKey) }
  async function create() {
    if (!form.title) return
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm(blank); refresh()
  }
  async function decide(id: string, status: string) {
    const decision = prompt(`มติ ARB (${status}) — ใส่หมายเหตุ`, '') ?? ''
    await fetch(`${listKey}/${id}/decide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, decision }) })
    refresh()
  }
  async function del(id: string) { await fetch(`${listKey}/${id}`, { method: 'DELETE' }); refresh() }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">⚖️ Architecture Review Board (ARB)</h1>
        <p className="text-xs text-zinc-500 mt-0.5">กระบวนการพิจารณา/อนุมัติสถาปัตยกรรม (architecture governance)</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <KPICard label="ทั้งหมด" value={dash?.total ?? '—'} />
        <KPICard label="รอพิจารณา" value={dash?.open ?? '—'} subVariant="warn" sub="open" />
        <KPICard label="อนุมัติ" value={dash?.approved ?? '—'} sub="approved" />
        <KPICard label="มีเงื่อนไข" value={dash?.conditional ?? '—'} subVariant="warn" sub="conditional" />
        <KPICard label="ปฏิเสธ" value={dash?.rejected ?? '—'} subVariant="danger" sub="rejected" />
      </div>

      <Card>
        <SectionHeader title="ARB Requests" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ ยื่นคำขอ</button>
        } />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 grid grid-cols-3 gap-2">
            <input placeholder="หัวข้อคำขอ *" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-3" />
            <select value={form.request_type} onChange={e => setForm((f: any) => ({ ...f, request_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select>
            <select value={form.risk_level} onChange={e => setForm((f: any) => ({ ...f, risk_level: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{['critical', 'high', 'medium', 'low'].map(r => <option key={r} value={r}>{r}</option>)}</select>
            <input placeholder="ผู้ยื่น" value={form.requested_by} onChange={e => setForm((f: any) => ({ ...f, requested_by: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <textarea placeholder="รายละเอียด" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-3" />
            <div className="col-span-3 flex gap-2"><button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">ยื่น</button><button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button></div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>เลขที่</Th><Th>หัวข้อ</Th><Th>ประเภท</Th><Th>Risk</Th><Th>สถานะ</Th><Th>มติ / การจัดการ</Th></tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.arb_number}</span></Td>
                    <Td><div className="font-medium text-zinc-800">{r.title}</div>{r.requested_by && <div className="text-[10px] text-zinc-400">โดย {r.requested_by}</div>}{Array.isArray(r.findings) && r.findings.length > 0 && <div className="text-[10px] text-amber-600">⚠ {r.findings.length} findings</div>}</Td>
                    <Td><span className="text-[11px] text-zinc-600 capitalize">{String(r.request_type).replace('_', ' ')}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase" style={{ background: riskColor(r.risk_level) + '22', color: riskColor(r.risk_level) }}>{r.risk_level}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: stColor(r.status)[0], color: stColor(r.status)[1] }}>{String(r.status).replace('_', ' ')}</span></Td>
                    <Td>
                      {['submitted', 'in_review', 'deferred'].includes(r.status) ? (
                        <div className="flex gap-1">
                          <button onClick={() => decide(r.id, 'approved')} className="glass-btn-primary text-[10px] px-2 py-0.5 rounded">อนุมัติ</button>
                          <button onClick={() => decide(r.id, 'conditional')} className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">มีเงื่อนไข</button>
                          <button onClick={() => decide(r.id, 'rejected')} className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">ปฏิเสธ</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 max-w-[180px] truncate">{r.decision || '—'}</span>
                          <button onClick={() => del(r.id)} className="glass-btn-danger text-[10px] px-1.5 py-0.5 rounded">ลบ</button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
