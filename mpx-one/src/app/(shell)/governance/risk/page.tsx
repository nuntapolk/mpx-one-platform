'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import type { RiskRegister } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

// Risk score → color
function scoreColor(s: number) {
  if (s >= 20) return '#E24B4A' // critical
  if (s >= 12) return '#EF9F27' // high
  if (s >= 6)  return '#F59E0B' // medium
  return '#10B981'               // low
}
function scoreLabel(s: number) {
  if (s >= 20) return 'Critical'
  if (s >= 12) return 'High'
  if (s >= 6)  return 'Medium'
  return 'Low'
}

const TREATMENT_STYLES: Record<string, string> = {
  avoid:    'bg-red-50    text-red-700',
  mitigate: 'bg-blue-50   text-blue-700',
  transfer: 'bg-purple-50 text-purple-700',
  accept:   'bg-zinc-100  text-zinc-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  it_risk: 'IT Risk', cyber_risk: 'Cyber', privacy_risk: 'Privacy',
  data_risk: 'Data', ai_risk: 'AI', third_party_risk: 'Third Party',
  compliance_risk: 'Compliance', operational_risk: 'Operational',
}

export default function RiskPage() {
  const statsKey = `${API}/api/v1/risk-registers/stats`
  const listKey  = `${API}/api/v1/risk-registers`
  const hmKey    = `${API}/api/v1/risk-registers/heatmap`

  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: risks, isLoading } = useSWR<RiskRegister[]>(listKey, fetcher)
  const { data: heatmap } = useSWR(hmKey, fetcher)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'it_risk', likelihood: 3, impact: 3, treatment: 'mitigate', description: '' })

  async function createRisk() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); mutate(hmKey)
    setShowForm(false)
    setForm({ title: '', category: 'it_risk', likelihood: 3, impact: 3, treatment: 'mitigate', description: '' })
  }

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Total Risks"   value={stats?.total ?? '—'} />
        <KPICard label="Open"          value={stats?.open  ?? '—'} subVariant="warn" />
        <KPICard label="Critical"      value={stats?.by_level?.critical ?? '—'} subVariant="danger" />
        <KPICard label="High"          value={stats?.by_level?.high ?? '—'} subVariant="warn" />
        <KPICard label="Overdue Actions" value={stats?.overdue_actions ?? '—'} subVariant="danger" />
      </div>

      {/* Heatmap + Register */}
      <div className="grid grid-cols-5 gap-4">
        {/* Heatmap 5×5 */}
        <Card className="col-span-2">
          <SectionHeader title="Risk Heatmap (Likelihood × Impact)" />
          <RiskHeatmap heatmap={heatmap} />
        </Card>

        {/* Top risks */}
        <Card className="col-span-3">
          <SectionHeader title="Top Risks" action={
            <button onClick={() => setShowForm(v => !v)}
              className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
              + เพิ่ม Risk
            </button>
          } />

          {showForm && (
            <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
              <input placeholder="ชื่อ Risk *" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
                className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))}
                  className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={form.treatment} onChange={e => setForm(v => ({ ...v, treatment: e.target.value }))}
                  className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                  {['avoid', 'mitigate', 'transfer', 'accept'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-zinc-600">
                  Likelihood
                  <input type="range" min={1} max={5} value={form.likelihood}
                    onChange={e => setForm(v => ({ ...v, likelihood: +e.target.value }))} className="w-20" />
                  <span className="font-medium w-4">{form.likelihood}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-600">
                  Impact
                  <input type="range" min={1} max={5} value={form.impact}
                    onChange={e => setForm(v => ({ ...v, impact: +e.target.value }))} className="w-20" />
                  <span className="font-medium w-4">{form.impact}</span>
                </label>
                <span className="text-xs font-bold" style={{ color: scoreColor(form.likelihood * form.impact) }}>
                  Score: {form.likelihood * form.impact} ({scoreLabel(form.likelihood * form.impact)})
                </span>
              </div>
              <textarea placeholder="คำอธิบาย (optional)" value={form.description}
                onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
              <div className="flex gap-2">
                <button onClick={createRisk} className="text-xs px-3 py-1.5 rounded text-white" style={{ background: '#02C39A' }}>บันทึก</button>
                <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded text-zinc-600 bg-zinc-100">ยกเลิก</button>
              </div>
            </div>
          )}

          {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
            : !risks || risks.length === 0 ? <Empty message="ยังไม่มี Risk — กด เพิ่ม Risk" />
            : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...(Array.isArray(risks) ? risks : [])].sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact)).map(r => {
                  const score = r.likelihood * r.impact
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: scoreColor(score) }}>{score}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 truncate">{r.title}</p>
                        <p className="text-[10px] text-zinc-400">{CATEGORY_LABELS[r.category] ?? r.category} · {r.risk_id}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TREATMENT_STYLES[r.treatment] ?? ''}`}>
                        {r.treatment}
                      </span>
                      <span className="text-[10px] text-zinc-400">{r.status}</span>
                    </div>
                  )
                })}
              </div>
            )
          }
        </Card>
      </div>

      {/* Full table */}
      <Card>
        <SectionHeader title="Risk Register ทั้งหมด" />
        {!Array.isArray(risks) || risks.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Risk ID</Th>
                <Th>ชื่อ Risk</Th>
                <Th>Category</Th>
                <Th>L</Th>
                <Th>I</Th>
                <Th>Score</Th>
                <Th>Treatment</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(risks) ? risks : []).map(r => {
                const score = r.likelihood * r.impact
                return (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.risk_id}</span></Td>
                    <Td>
                      <p className="font-medium text-zinc-800">{r.title}</p>
                      {r.description && <p className="text-[10px] text-zinc-400 truncate max-w-xs">{r.description}</p>}
                    </Td>
                    <Td><span className="text-xs">{CATEGORY_LABELS[r.category] ?? r.category}</span></Td>
                    <Td><span className="text-xs font-medium">{r.likelihood}</span></Td>
                    <Td><span className="text-xs font-medium">{r.impact}</span></Td>
                    <Td>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: scoreColor(score) }}>{score}</span>
                    </Td>
                    <Td>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TREATMENT_STYLES[r.treatment] ?? ''}`}>
                        {r.treatment}
                      </span>
                    </Td>
                    <Td><span className={`text-xs ${r.status === 'open' ? 'text-red-600' : r.status === 'in_progress' ? 'text-amber-600' : 'text-emerald-600'}`}>{r.status}</span></Td>
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

// ── Risk Heatmap Component ──────────────────────────────────────
function RiskHeatmap({ heatmap }: { heatmap: any }) {
  if (!heatmap?.matrix) {
    return <div className="py-8 text-center text-xs text-zinc-300">กำลังโหลด...</div>
  }

  function cellColor(l: number, i: number) {
    const score = l * i
    if (score >= 20) return '#FECACA' // critical
    if (score >= 12) return '#FDE68A' // high
    if (score >= 6)  return '#FEF3C7' // medium
    return '#D1FAE5'                   // low
  }

  return (
    <div className="mt-2">
      {/* Y axis label */}
      <div className="flex">
        <div className="w-16 text-[10px] text-zinc-400 flex items-center justify-center" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: 150 }}>
          Impact →
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map(impact => (
            <div key={impact} className="flex gap-0.5 mb-0.5">
              <span className="w-4 text-[9px] text-zinc-400 flex items-center justify-end pr-1">{impact}</span>
              {[1, 2, 3, 4, 5].map(likelihood => {
                const key = `${likelihood}-${impact}`
                const items = heatmap.matrix[key] ?? []
                return (
                  <div key={key} title={items.map((r: any) => r.title).join(', ')}
                    className="flex-1 h-7 rounded flex items-center justify-center text-[10px] font-medium cursor-default transition-opacity hover:opacity-80"
                    style={{ background: cellColor(likelihood, impact), color: '#374151' }}>
                    {items.length > 0 ? items.length : ''}
                  </div>
                )
              })}
            </div>
          ))}
          {/* X axis labels */}
          <div className="flex mt-1">
            <span className="w-4" />
            {[1, 2, 3, 4, 5].map(l => (
              <span key={l} className="flex-1 text-[9px] text-zinc-400 text-center">{l}</span>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-1">Likelihood →</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-3 mt-2 justify-center">
        {[['#D1FAE5', 'Low'], ['#FEF3C7', 'Medium'], ['#FDE68A', 'High'], ['#FECACA', 'Critical']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: c }} />
            <span className="text-[10px] text-zinc-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
