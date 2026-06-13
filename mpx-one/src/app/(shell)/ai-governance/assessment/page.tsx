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
  const [view, setView] = useState<'list' | 'analytics'>('list')
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

      <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
        <button onClick={() => setView('list')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${view === 'list' ? 'glass-tab active' : 'glass-tab'}`}>📋 รายการ</button>
        <button onClick={() => setView('analytics')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${view === 'analytics' ? 'glass-tab active' : 'glass-tab'}`}>📈 Analytics</button>
      </div>

      {view === 'analytics' ? <Analytics /> : (
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
      )}
    </div>
  )
}

/* P5 — AI Governance Analytics */
const PAL = ['#15803d', '#1d4ed8', '#d97706', '#7c3aed', '#0369a1', '#c0272d', '#64748b']
function Bars({ data, colorMap }: { data: Record<string, number>; colorMap?: (k: string) => string }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(e => e[1]))
  if (!entries.length) return <Empty message="ไม่มีข้อมูล" />
  return (
    <div className="space-y-1.5">
      {entries.map(([k, v], i) => (
        <div key={k} className="flex items-center gap-2">
          <div className="w-28 text-[11px] text-zinc-500 truncate capitalize" title={k}>{String(k).replace(/_/g, ' ')}</div>
          <div className="flex-1 h-4 bg-zinc-100 rounded overflow-hidden"><div className="h-full rounded flex items-center justify-end pr-1.5 text-[9px] text-white font-medium" style={{ width: `${Math.max(8, v / max * 100)}%`, background: colorMap ? colorMap(k) : PAL[i % PAL.length] }}>{v}</div></div>
        </div>
      ))}
    </div>
  )
}
function Analytics() {
  const { data } = useSWR(`${API}/api/v1/ai-assessments/analytics`, fetcher)
  if (!data) return <Card><div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div></Card>
  const heatColor = (n: number) => n === 0 ? '#f4f4f5' : n >= 3 ? '#c0272d' : n >= 2 ? '#d97706' : '#fde68a'
  const phases = ['intake', 'risk', 'approval', 'implementation', 'operations', 'closed']
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card><SectionHeader title="ตาม Risk Tier" /><Bars data={data.by_tier} colorMap={(k) => ({ high: '#c0272d', medium: '#d97706', low: '#15803d' } as any)[k]} /></Card>
        <Card><SectionHeader title="ตาม Phase" /><Bars data={data.by_phase} /></Card>
        <Card><SectionHeader title="คะแนนเสี่ยงเฉลี่ยต่อ Domain" /><Bars data={data.domain_avg} colorMap={(_) => '#1d4ed8'} /></Card>
        <Card><SectionHeader title="Regulatory Coverage" /><Bars data={data.regulatory} colorMap={(_) => '#0369a1'} /></Card>
        <Card><SectionHeader title="การกระจายคะแนนเสี่ยง" /><Bars data={data.score_buckets} colorMap={(k) => k.includes('สูง') ? '#c0272d' : k.includes('กลาง') ? '#d97706' : '#15803d'} /></Card>
        <Card><SectionHeader title="Approval Funnel" /><Bars data={data.funnel} /></Card>
      </div>

      {/* Heatmap: tier × phase */}
      <Card>
        <SectionHeader title="🔥 Risk Heatmap (Tier × Phase)" />
        <table className="text-[11px] w-full">
          <thead><tr><th className="text-left p-1 text-zinc-400"></th>{phases.map(p => <th key={p} className="p-1 text-zinc-500 capitalize font-medium">{p}</th>)}</tr></thead>
          <tbody>
            {['high', 'medium', 'low'].map(t => (
              <tr key={t}>
                <td className="p-1 font-semibold capitalize" style={{ color: ({ high: '#c0272d', medium: '#d97706', low: '#15803d' } as any)[t] }}>{t}</td>
                {phases.map(p => { const n = data.heatmap?.[t]?.[p] ?? 0; return <td key={p} className="p-1 text-center font-medium" style={{ background: heatColor(n), color: n >= 2 ? '#fff' : '#71717a' }}>{n || ''}</td> })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Top risky */}
      <Card>
        <SectionHeader title="⚠️ ความเสี่ยงสูงสุด (Top consolidated score)" />
        {(data.top_risky || []).length === 0 ? <Empty message="ยังไม่มีคะแนน" /> : (
          <div className="space-y-1">
            {data.top_risky.map((a: any) => (
              <Link key={a.id} href={`/ai-governance/assessment/${a.id}`} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-zinc-50 border-b border-zinc-100 last:border-0">
                <span className="font-mono text-[10px] text-zinc-400">{a.code}</span>
                <span className="text-zinc-700 flex-1 truncate">{a.title}</span>
                {a.tier && <span className="text-[9px] px-1.5 rounded-full font-bold uppercase" style={{ background: tierColor(a.tier)[0], color: tierColor(a.tier)[1] }}>{a.tier}</span>}
                <span className="text-xs font-bold" style={{ color: a.score >= 70 ? '#c0272d' : a.score >= 40 ? '#d97706' : '#15803d' }}>{a.score}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
