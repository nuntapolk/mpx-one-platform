'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TYPE_LABEL: Record<string, string> = {
  access: 'ขอเข้าถึงข้อมูล', rectification: 'ขอแก้ไข', erasure: 'ขอลบข้อมูล',
  restriction: 'ขอจำกัดการประมวลผล', portability: 'ขอโอนย้ายข้อมูล',
  objection: 'คัดค้าน', withdraw_consent: 'ถอนความยินยอม',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'รอดำเนินการ', in_review: 'กำลังตรวจสอบ', awaiting_info: 'รอข้อมูลเพิ่ม',
  completed: 'เสร็จสิ้น', rejected: 'ปฏิเสธ', withdrawn: 'ถอนคำขอ',
}
const SLA_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  on_track: { bg: '#F0FDF4', color: '#166534', label: 'ตามกำหนด' },
  warning:  { bg: '#FFFBEB', color: '#92400E', label: 'ใกล้ครบ' },
  critical: { bg: '#FFF7ED', color: '#C2410C', label: 'วิกฤต' },
  overdue:  { bg: '#FEF2F2', color: '#991B1B', label: 'เกิน SLA' },
  closed:   { bg: '#F4F4F5', color: '#71717A', label: 'ปิดแล้ว' },
  no_sla:   { bg: '#F4F4F5', color: '#A1A1AA', label: '—' },
}
const NEXT_STATUS: Record<string, string> = {
  pending: 'in_review', in_review: 'completed', awaiting_info: 'in_review',
}

export default function DsarPage() {
  const statsKey = `${API}/api/v1/dsar/stats`
  const listKey  = `${API}/api/v1/dsar`
  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: list } = useSWR(listKey, fetcher)
  const { data: ropas } = useSWR(`${API}/api/v1/ropa`, fetcher)
  const rows = Array.isArray(list) ? list : []
  const ropaList = Array.isArray(ropas) ? ropas : []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'access', requester_name: '', requester_email: '', description: '', related_ropa: '' })

  async function create() {
    const payload: any = { ...form }
    if (form.related_ropa) payload.ropa_linked_process_ids = [form.related_ropa]
    delete payload.related_ropa
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    mutate(listKey); mutate(statsKey)
    setShowForm(false); setForm({ type: 'access', requester_name: '', requester_email: '', description: '', related_ropa: '' })
  }
  async function advance(id: string, status: string) {
    await fetch(`${API}/api/v1/dsar/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    mutate(listKey); mutate(statsKey)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="คำขอทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="กำลังดำเนินการ" value={stats?.open ?? '—'} subVariant="warn" />
        <KPICard label="เกิน SLA" value={stats?.overdue ?? '—'} subVariant="danger" />
        <KPICard label="วิกฤต (≤3 วัน)" value={stats?.critical ?? '—'} subVariant="danger" />
        <KPICard label="เสร็จสิ้น" value={stats?.completed ?? '—'} subVariant="up" />
      </div>

      <Card>
        <SectionHeader title="Data Subject Rights Requests (DSAR)" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ คำขอใหม่</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {Object.entries(TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input placeholder="ชื่อผู้ขอ *" value={form.requester_name} onChange={e => setForm(v => ({ ...v, requester_name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            </div>
            <input placeholder="อีเมลผู้ขอ" value={form.requester_email} onChange={e => setForm(v => ({ ...v, requester_email: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <textarea placeholder="รายละเอียดคำขอ" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <select value={form.related_ropa} onChange={e => setForm(v => ({ ...v, related_ropa: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded">
              <option value="">— เชื่อมกับกิจกรรมประมวลผล ROPA (optional) —</option>
              {ropaList.map((r: any) => <option key={r.id} value={r.id}>{r.ropa_code} · {r.processing_activity_name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก (SLA 30 วัน)</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {rows.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead><tr>
              <Th>Ticket</Th><Th>ประเภท</Th><Th>ผู้ขอ</Th><Th>สถานะ</Th><Th>SLA</Th><Th>วันครบกำหนด</Th><Th>&nbsp;</Th>
            </tr></thead>
            <tbody>
              {rows.map((r: any) => {
                const sla = SLA_STYLE[r.sla_status] ?? SLA_STYLE.no_sla
                const next = NEXT_STATUS[r.status]
                return (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.ticket_number}</span></Td>
                    <Td><span className="text-xs text-zinc-700">{TYPE_LABEL[r.type] ?? r.type}</span></Td>
                    <Td>
                      <p className="text-xs font-medium text-zinc-800">{r.requester_name}</p>
                      <p className="text-[10px] text-zinc-400">{r.requester_email}</p>
                    </Td>
                    <Td><span className="text-xs text-zinc-600">{STATUS_LABEL[r.status] ?? r.status}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sla.bg, color: sla.color }}>{sla.label}</span></Td>
                    <Td><span className="text-xs text-zinc-500">{r.due_date ? new Date(r.due_date).toLocaleDateString('th-TH') : '—'}</span></Td>
                    <Td>{next && <button onClick={() => advance(r.id, next)} className="glass-btn-emerald text-[10px] px-2 py-0.5 rounded">→ {STATUS_LABEL[next]}</button>}</Td>
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
