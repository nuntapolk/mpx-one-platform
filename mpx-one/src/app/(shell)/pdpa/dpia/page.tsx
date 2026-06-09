'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const RISK: Record<string, { bg: string; c: string }> = {
  critical: { bg: '#FEF2F2', c: '#B91C1C' }, high: { bg: '#FFFBEB', c: '#D97706' },
  medium: { bg: '#F0F9FF', c: '#0369A1' }, low: { bg: '#F0FDF4', c: '#166534' },
}
const STATUS_LABEL: Record<string, string> = {
  screening: 'คัดกรอง', in_progress: 'กำลังประเมิน', under_review: 'รอตรวจ',
  approved: 'อนุมัติ', rejected: 'ปฏิเสธ', completed: 'เสร็จสิ้น',
}
const NEXT: Record<string, string> = { screening: 'in_progress', in_progress: 'under_review', under_review: 'completed' }

export default function DpiaPage() {
  const statsKey = `${API}/api/v1/dpia/stats`
  const listKey = `${API}/api/v1/dpia`
  const candKey = `${API}/api/v1/dpia/candidates`
  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: list } = useSWR(listKey, fetcher)
  const { data: cands } = useSWR(candKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const candidates = Array.isArray(cands) ? cands : []

  const [form, setForm] = useState<any>({ title: '', ropa_record_id: '', trigger_reason: '', risk_level: 'high', residual_risk_level: 'medium' })
  const [showForm, setShowForm] = useState(false)

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); mutate(candKey); setShowForm(false)
    setForm({ title: '', ropa_record_id: '', trigger_reason: '', risk_level: 'high', residual_risk_level: 'medium' })
  }
  async function advance(id: string, status: string) {
    await fetch(`${API}/api/v1/dpia/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    mutate(listKey); mutate(statsKey)
  }
  async function consult(id: string) {
    await fetch(`${API}/api/v1/dpia/${id}/consult-pdpc`, { method: 'POST' })
    mutate(listKey); mutate(statsKey)
  }
  function startFromCandidate(c: any) {
    setForm((f: any) => ({ ...f, title: `DPIA — ${c.processing_activity_name}`, ropa_record_id: c.id, risk_level: c.risk_level }))
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="DPIA ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="กำลังประเมิน" value={stats?.in_progress ?? '—'} subVariant="warn" />
        <KPICard label="เสร็จสิ้น" value={stats?.completed ?? '—'} subVariant="up" />
        <KPICard label="Residual สูง" value={stats?.high_residual ?? '—'} subVariant="danger" />
        <KPICard label="ต้องปรึกษา PDPC" value={stats?.need_pdpc_consult ?? '—'} subVariant="danger" />
      </div>

      {candidates.length > 0 && (
        <Card>
          <SectionHeader title={`⚠ ROPA ที่ต้องทำ DPIA แต่ยังไม่มี (${candidates.length})`} />
          <div className="space-y-1">
            {candidates.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
                <div><span className="font-mono text-[10px] text-zinc-400 mr-2">{c.ropa_code}</span><span className="text-zinc-700">{c.processing_activity_name}</span></div>
                <button onClick={() => startFromCandidate(c)} className="glass-btn-primary text-[10px] px-2 py-0.5 rounded">เริ่ม DPIA</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader title="DPIA — Data Protection Impact Assessment" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ DPIA ใหม่</button>
        } />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อ DPIA *" value={form.title} onChange={e => setForm((v: any) => ({ ...v, title: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <textarea placeholder="เหตุผลที่ต้องทำ DPIA" value={form.trigger_reason} onChange={e => setForm((v: any) => ({ ...v, trigger_reason: e.target.value }))} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-zinc-500">Risk เริ่มต้น
                <select value={form.risk_level} onChange={e => setForm((v: any) => ({ ...v, risk_level: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded mt-0.5">
                  {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-zinc-500">Residual risk
                <select value={form.residual_risk_level} onChange={e => setForm((v: any) => ({ ...v, residual_risk_level: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded mt-0.5">
                  {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <p className="text-[10px] text-zinc-400">หมายเหตุ: residual risk สูง/critical จะ flag ต้องปรึกษา PDPC อัตโนมัติ</p>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {rows.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead><tr><Th>Number</Th><Th>หัวข้อ</Th><Th>Risk</Th><Th>Residual</Th><Th>PDPC</Th><Th>สถานะ</Th><Th>&nbsp;</Th></tr></thead>
            <tbody>
              {rows.map((d: any) => {
                const r = RISK[d.risk_level] ?? RISK.medium
                const rr = RISK[d.residual_risk_level] ?? { bg: '#f4f4f5', c: '#999' }
                const next = NEXT[d.status]
                return (
                  <tr key={d.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{d.dpia_number}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{d.title}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: r.bg, color: r.c }}>{d.risk_level}</span></Td>
                    <Td>{d.residual_risk_level ? <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: rr.bg, color: rr.c }}>{d.residual_risk_level}</span> : '—'}</Td>
                    <Td>{d.consultation_required ? (d.pdpc_consulted_at ? <span className="text-[10px] text-emerald-600">ปรึกษาแล้ว</span> : <button onClick={() => consult(d.id)} className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">ต้องปรึกษา</button>) : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td><span className="text-xs text-zinc-600">{STATUS_LABEL[d.status] ?? d.status}</span></Td>
                    <Td>{next && <button onClick={() => advance(d.id, next)} className="glass-btn-emerald text-[10px] px-2 py-0.5 rounded">→ {STATUS_LABEL[next]}</button>}</Td>
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
