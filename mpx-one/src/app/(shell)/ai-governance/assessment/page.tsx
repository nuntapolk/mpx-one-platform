'use client'
import { useState } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const tierColor = (t: string) => (({ low: ['#dcfce7', '#15803d'], medium: ['#fef3c7', '#d97706'], high: ['#fee2e2', '#c0272d'] } as any)[t] || ['#f1f5f9', '#64748b'])
const stColor = (s: string) => (({ in_progress: ['#eff6ff', '#1d4ed8'], approved: ['#dcfce7', '#15803d'], conditional: ['#fef3c7', '#d97706'], rejected: ['#fee2e2', '#c0272d'], live: ['#e0f2fe', '#0369a1'], retired: ['#f1f5f9', '#64748b'] } as any)[s] || ['#f1f5f9', '#64748b'])
const PHASE_LABEL: Record<string, string> = { intake: '① Intake', risk: '② Risk', approval: '③ Approval', implementation: '④ Implement', operations: '⑤ Operations', closed: 'Closed' }

export default function Page() {
  const listKey = `${API}/api/v1/ai-assessments`
  const statsKey = `${API}/api/v1/ai-assessments/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: useCases } = useSWR(`${API}/api/v1/ai-use-cases`, fetcher)
  const rows = Array.isArray(list) ? list : []
  const ucList = Array.isArray(useCases) ? useCases : []
  const [showForm, setShowForm] = useState(false)
  const blank = { title: '', requester: '', ai_use_case_id: '', risk_tier: '', regulatory: [] as string[] }
  const [form, setForm] = useState<any>(blank)

  async function create() {
    if (!form.title) return
    const body = { ...form, ai_use_case_id: form.ai_use_case_id || null, risk_tier: form.risk_tier || undefined }
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowForm(false); setForm(blank); mutate(listKey); mutate(statsKey)
  }
  const toggleReg = (r: string) => setForm((f: any) => ({ ...f, regulatory: f.regulatory.includes(r) ? f.regulatory.filter((x: string) => x !== r) : [...f.regulatory, r] }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">🤖 AI Risk Assessment</h1>
        <p className="text-xs text-zinc-500 mt-0.5">21-step Sequential AI Governance Workflow (สอดคล้อง ธปท./คปภ./PDPA)</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="รออนุมัติ" value={stats?.pending_approval ?? '—'} subVariant="warn" sub="pending" />
        <KPICard label="ความเสี่ยงสูง" value={stats?.high_risk ?? '—'} subVariant="danger" sub="high tier" />
        <KPICard label="ใช้งานจริง" value={stats?.live ?? '—'} sub="live" />
      </div>

      <Card>
        <SectionHeader title="AI Assessments" action={<button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เริ่มประเมิน</button>} />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="ชื่อระบบ/Use case *" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="ผู้ยื่นคำขอ" value={form.requester} onChange={e => setForm((f: any) => ({ ...f, requester: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <select value={form.ai_use_case_id} onChange={e => setForm((f: any) => ({ ...f, ai_use_case_id: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                <option value="">— ผูก AI Use Case (auto risk tier) —</option>
                {ucList.map((u: any) => <option key={u.id} value={u.id}>{u.ai_use_case_name}</option>)}
              </select>
              <select value={form.risk_tier} onChange={e => setForm((f: any) => ({ ...f, risk_tier: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                <option value="">— Risk Tier (auto ถ้าผูก use case) —</option>{['low', 'medium', 'high'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[11px] text-zinc-500">Regulatory:</span>
              {['BOT', 'OIC', 'PDPA'].map(r => (
                <button key={r} onClick={() => toggleReg(r)} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: form.regulatory.includes(r) ? '#e0f2fe' : '#f4f4f5', color: form.regulatory.includes(r) ? '#0369a1' : '#a1a1aa' }}>{form.regulatory.includes(r) ? '✓ ' : ''}{r}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">เริ่มประเมิน</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}
        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>Code</Th><Th>ชื่อระบบ</Th><Th>Phase</Th><Th>Risk Tier</Th><Th>Score</Th><Th>Status</Th><Th>ความคืบหน้า</Th></tr></thead>
              <tbody>
                {rows.map((a: any) => {
                  const done = (a.steps || []).filter((s: any) => s.status === 'completed').length
                  const pct = Math.round(done / 21 * 100)
                  return (
                    <tr key={a.id} className="hover:bg-zinc-50">
                      <Td><span className="font-mono text-[10px] text-zinc-400">{a.assessment_code}</span></Td>
                      <Td><Link href={`/ai-governance/assessment/${a.id}`} className="font-medium text-zinc-800 hover:text-blue-600 hover:underline">{a.title}</Link></Td>
                      <Td><span className="text-[11px] text-zinc-600">{PHASE_LABEL[a.phase] ?? a.phase}</span></Td>
                      <Td>{a.risk_tier ? <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: tierColor(a.risk_tier)[0], color: tierColor(a.risk_tier)[1] }}>{a.risk_tier}</span> : '—'}</Td>
                      <Td><span className="text-xs font-medium" style={{ color: (a.consolidated_score ?? 0) >= 70 ? '#c0272d' : (a.consolidated_score ?? 0) >= 40 ? '#d97706' : '#15803d' }}>{a.consolidated_score ?? '—'}</span></Td>
                      <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: stColor(a.status)[0], color: stColor(a.status)[1] }}>{String(a.status).replace('_', ' ')}</span></Td>
                      <Td><div className="flex items-center gap-1"><div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} /></div><span className="text-[10px] text-zinc-500">{done}/21</span></div></Td>
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
