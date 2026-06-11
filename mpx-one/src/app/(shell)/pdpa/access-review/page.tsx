'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const LEVELS = ['read', 'write', 'admin', 'full']
const DECISIONS = ['retain', 'modify', 'revoke']
const decColor = (d: string) => (({ retain: ['#dcfce7', '#15803d'], modify: ['#fef3c7', '#d97706'], revoke: ['#fee2e2', '#c0272d'], pending: ['#f1f5f9', '#64748b'] } as any)[d] || ['#f1f5f9', '#64748b'])
const lvlColor = (l: string) => (({ read: '#0369a1', write: '#7c3aed', admin: '#d97706', full: '#c0272d' } as any)[l] || '#64748b')
const today = () => new Date().toISOString().slice(0, 10)
const isOverdue = (r: any) => r.status === 'pending' && r.due_date && String(r.due_date).slice(0, 10) < today()

export default function Page() {
  const listKey = `${API}/api/v1/access-reviews`
  const statsKey = `${API}/api/v1/access-reviews/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const empty = { review_cycle: '2026-Q2', reviewer_name: '', user_under_review_name: '', system_name: '', access_level: '', access_scope: '', decision: 'pending', justification: '', due_date: '' }
  const [form, setForm] = useState<any>(empty)

  const filtered = rows.filter(r => filter === 'all' ? true : filter === 'overdue' ? isOverdue(r) : r.status === filter)

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); setShowForm(false); setForm(empty)
  }
  async function decide(id: string, decision: string) {
    await fetch(`${listKey}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) })
    mutate(listKey); mutate(statsKey)
  }
  async function del(id: string) {
    await fetch(`${listKey}/${id}`, { method: 'DELETE' }); mutate(listKey); mutate(statsKey)
  }
  async function bulk(decision: string) {
    if (sel.size === 0) return
    await fetch(`${listKey}/bulk-complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [...sel], decision }) })
    setSel(new Set()); mutate(listKey); mutate(statsKey)
  }
  function toggle(id: string) { setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  const FILTERS = [['all', 'ทั้งหมด'], ['pending', 'รอตรวจ'], ['overdue', 'เกินกำหนด'], ['completed', 'เสร็จแล้ว']]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="รอตรวจสอบ" value={stats?.pending ?? '—'} subVariant="warn" sub="pending" />
        <KPICard label="เกินกำหนด" value={stats?.overdue ?? '—'} subVariant="danger" sub="overdue" />
        <KPICard label="เสร็จแล้ว" value={stats?.completed ?? '—'} sub="completed" />
      </div>

      <Card>
        <SectionHeader title="Access Review — ทบทวนสิทธิ์เข้าถึง" action={
          <div className="flex gap-2 items-center">
            {sel.size > 0 && (
              <>
                <span className="text-xs text-zinc-500">เลือก {sel.size}:</span>
                {DECISIONS.map(d => <button key={d} onClick={() => bulk(d)} className="glass-btn-soft text-[10px] px-2 py-1 rounded capitalize">{d}</button>)}
              </>
            )}
            <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม</button>
          </div>
        } />

        <div className="flex gap-1 mb-3">
          {FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`text-xs px-3 py-1 rounded-md ${filter === k ? 'glass-tab active' : 'glass-tab'}`}>{l}</button>
          ))}
        </div>

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 grid grid-cols-3 gap-2">
            <input placeholder="รอบทบทวน (เช่น 2026-Q2)" value={form.review_cycle} onChange={e => setForm((f: any) => ({ ...f, review_cycle: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ผู้ตรวจสอบ" value={form.reviewer_name} onChange={e => setForm((f: any) => ({ ...f, reviewer_name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ผู้ถูกตรวจสอบ *" value={form.user_under_review_name} onChange={e => setForm((f: any) => ({ ...f, user_under_review_name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ระบบ" value={form.system_name} onChange={e => setForm((f: any) => ({ ...f, system_name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <select value={form.access_level} onChange={e => setForm((f: any) => ({ ...f, access_level: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— ระดับสิทธิ์ —</option>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
            <input type="date" value={form.due_date} onChange={e => setForm((f: any) => ({ ...f, due_date: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ขอบเขตการเข้าถึง" value={form.access_scope} onChange={e => setForm((f: any) => ({ ...f, access_scope: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-2" />
            <select value={form.decision} onChange={e => setForm((f: any) => ({ ...f, decision: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="pending">pending</option>{DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <div className="col-span-3 flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : filtered.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>&nbsp;</Th><Th>ผู้ถูกตรวจสอบ</Th><Th>ระบบ</Th><Th>สิทธิ์</Th><Th>รอบ</Th><Th>กำหนด</Th><Th>Decision</Th><Th>การจัดการ</Th></tr></thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td>{r.status === 'pending' && <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} />}</Td>
                    <Td><div className="font-medium text-zinc-800">{r.user_under_review_name || '—'}</div>{r.reviewer_name && <div className="text-[10px] text-zinc-400">ผู้ตรวจ: {r.reviewer_name}</div>}</Td>
                    <Td><span className="text-xs text-zinc-600">{r.system_name || '—'}</span>{r.access_scope && <div className="text-[10px] text-zinc-400 truncate max-w-[160px]">{r.access_scope}</div>}</Td>
                    <Td>{r.access_level ? <span className="text-[10px] font-bold uppercase" style={{ color: lvlColor(r.access_level) }}>{r.access_level}</span> : '—'}</Td>
                    <Td><span className="text-[10px] text-zinc-500">{r.review_cycle || '—'}</span></Td>
                    <Td>{r.due_date ? <span className={`text-xs ${isOverdue(r) ? 'text-red-600 font-medium' : 'text-zinc-500'}`}>{String(r.due_date).slice(0, 10)}{isOverdue(r) && ' ⚠️'}</span> : '—'}</Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: decColor(r.decision)[0], color: decColor(r.decision)[1] }}>{r.decision}</span></Td>
                    <Td>
                      <div className="flex gap-1">
                        {r.status === 'pending' && DECISIONS.map(d => (
                          <button key={d} onClick={() => decide(r.id, d)} title={d} className="glass-btn-soft text-[10px] px-1.5 py-0.5 rounded capitalize">{d[0].toUpperCase()}</button>
                        ))}
                        <button onClick={() => del(r.id)} className="glass-btn-danger text-[10px] px-1.5 py-0.5 rounded">ลบ</button>
                      </div>
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
