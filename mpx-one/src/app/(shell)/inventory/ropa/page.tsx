'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

function critBg(v: string) { return ({ critical:'#FEF2F2', high:'#FFFBEB', medium:'#F0F9FF', low:'#F0FDF4' } as any)[v] || '#f4f4f5' }
function critFg(v: string) { return ({ critical:'#B91C1C', high:'#D97706', medium:'#0369A1', low:'#166534' } as any)[v] || '#71717a' }
function compColor(p: number) { return p >= 80 ? '#1D9E75' : p >= 50 ? '#EF9F27' : '#E24B4A' }

const DPIA_LABEL: Record<string, string> = {
  not_started: 'ยังไม่เริ่ม', in_progress: 'กำลังทำ', completed: 'เสร็จแล้ว', not_required: 'ไม่ต้องทำ',
}

export default function RopaPage() {
  const listKey = `${API}/api/v1/ropa`
  const statsKey = `${API}/api/v1/ropa/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const rows = Array.isArray(list) ? list : []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ processing_activity_name: '', purpose: '', lawful_basis: '', data_subject_type: '', risk_level: 'medium' })
  const [openId, setOpenId] = useState<string | null>(null)
  const { data: detail } = useSWR(openId ? `${API}/api/v1/ropa/${openId}` : null, fetcher)

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); setShowForm(false)
    setForm({ processing_activity_name: '', purpose: '', lawful_basis: '', data_subject_type: '', risk_level: 'medium' })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="ROPA ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="ความสมบูรณ์เฉลี่ย" value={stats ? `${stats.avg_completeness}%` : '—'} subVariant={stats?.avg_completeness >= 80 ? 'up' : 'warn'} />
        <KPICard label="ไม่ครบ (<80%)" value={stats?.incomplete ?? '—'} subVariant="warn" />
        <KPICard label="ต้องทำ DPIA" value={stats?.dpia_required ?? '—'} subVariant="danger" />
        <KPICard label="Cross-border" value={stats?.cross_border ?? '—'} subVariant="warn" />
      </div>

      <Card>
        <SectionHeader title="ROPA — Records of Processing Activities" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม ROPA</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อกิจกรรมการประมวลผล *" value={form.processing_activity_name} onChange={e => setForm(v => ({ ...v, processing_activity_name: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <textarea placeholder="วัตถุประสงค์" value={form.purpose} onChange={e => setForm(v => ({ ...v, purpose: e.target.value }))} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="ฐานทางกฎหมาย" value={form.lawful_basis} onChange={e => setForm(v => ({ ...v, lawful_basis: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="ประเภทเจ้าของข้อมูล" value={form.data_subject_type} onChange={e => setForm(v => ({ ...v, data_subject_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <select value={form.risk_level} onChange={e => setForm(v => ({ ...v, risk_level: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr>
                <Th>Code</Th><Th>กิจกรรม</Th><Th>ฐานกฎหมาย</Th>
                <Th>Risk</Th><Th>DPIA</Th><Th>ความสมบูรณ์</Th><Th>&nbsp;</Th>
              </tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.ropa_code}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{r.processing_activity_name}</span></Td>
                    <Td><span className="text-[11px] text-zinc-600">{r.lawful_basis || '—'}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: critBg(r.risk_level), color: critFg(r.risk_level) }}>{r.risk_level}</span></Td>
                    <Td>{r.dpia_required_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{DPIA_LABEL[r.dpia_status] ?? 'ต้องทำ'}</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.completeness}%`, background: compColor(r.completeness) }} />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: compColor(r.completeness) }}>{r.completeness}%</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">{openId === r.id ? 'ปิด' : 'phases'}</button>
                        <Link href={`/inventory/ropa/${r.id}`} className="glass-btn-primary text-[10px] px-2 py-0.5 rounded">แก้ไข</Link>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}

        {openId && detail?.completeness?.sections && (
          <div className="mt-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-xs font-semibold text-zinc-700 mb-3">
              {detail.processing_activity_name} — ความสมบูรณ์ {detail.completeness.overall_pct}%
            </p>
            <div className="grid grid-cols-5 gap-2">
              {detail.completeness.sections.map((s: any) => (
                <div key={s.key} className="text-center">
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: compColor(s.pct) }} />
                  </div>
                  <p className="text-[10px] text-zinc-600">{s.label}</p>
                  <p className="text-[10px] font-medium" style={{ color: compColor(s.pct) }}>{s.filled}/{s.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
