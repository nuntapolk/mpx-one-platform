'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Card, SectionHeader, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const tierColor = (t: string) => (({ low: '#15803d', medium: '#d97706', high: '#c0272d' } as any)[t] || '#64748b')
const scoreColor = (v: number) => v >= 70 ? '#c0272d' : v >= 40 ? '#d97706' : '#15803d'
const DOMAIN_LABEL: Record<string, string> = { data: 'Data', model: 'Model/LLM', ethical: 'Ethical', cyber: 'Cyber', vendor: 'Vendor', agentic: 'Agentic' }
const stStyle = (s: string) => (({ completed: ['#15803d', '✓'], in_progress: ['#1d4ed8', '●'], skipped: ['#a1a1aa', '–'] } as any)[s] || ['#d4d4d8', '○'])

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const key = `${API}/api/v1/ai-assessments/${id}`
  const { data: a, mutate } = useSWR(key, fetcher)
  const { data: tpl } = useSWR(`${API}/api/v1/ai-assessments/template`, fetcher)
  const { data: links, mutate: mutateLinks } = useSWR(`${key}/links`, fetcher)
  const { data: vendors } = useSWR(`${API}/api/v1/vendors`, fetcher)
  const { data: courses } = useSWR(`${API}/api/v1/training`, fetcher)
  const [editStep, setEditStep] = useState<number | null>(null)
  const [draft, setDraft] = useState<any>({})

  if (!a || a.statusCode) return <div className="p-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
  const phases = tpl?.phases || []
  const stepDefs: any[] = tpl?.steps || []
  const stepState = (no: number) => (a.steps || []).find((s: any) => s.no === no) || { no, status: 'pending' }
  const done = (a.steps || []).filter((s: any) => s.status === 'completed').length

  async function saveStep(no: number) {
    await fetch(`${key}/step/${no}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: draft.status || 'completed', notes: draft.notes, evidence: draft.evidence }) })
    await mutate(); setEditStep(null); setDraft({})
  }
  async function setScore(domain: string, score: number) {
    await fetch(`${key}/score/${domain}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }) }); mutate()
  }
  async function decide(status: string) {
    const conditions = status === 'conditional' ? prompt('ระบุเงื่อนไข:') || '' : ''
    await fetch(`${key}/decide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, decision: `มติ: ${status}`, conditions }) }); mutate()
  }
  async function toggleGuardrail(i: number) {
    const g = [...(a.guardrails || [])]; g[i] = { ...g[i], enabled: !g[i].enabled }
    await fetch(key, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guardrails: g }) }); mutate()
  }
  async function post(path: string, body?: any) {
    await fetch(`${key}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    mutate(); mutateLinks()
  }
  async function saveField(patch: any) { await fetch(key, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); mutate() }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* header */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/ai-governance/assessment" className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">← กลับ</Link>
              <span className="font-mono text-[10px] text-zinc-400">{a.assessment_code}</span>
              {a.risk_tier && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: tierColor(a.risk_tier) + '22', color: tierColor(a.risk_tier) }}>{a.risk_tier} risk</span>}
              {(a.regulatory || []).map((r: string) => <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">{r}</span>)}
            </div>
            <h1 className="text-sm font-semibold text-zinc-900">{a.title}</h1>
            <p className="text-[10px] text-zinc-400 mt-0.5 capitalize">{String(a.status).replace('_', ' ')} · {done}/21 steps</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: scoreColor(a.consolidated_score ?? 0) }}>{a.consolidated_score ?? '—'}</div>
            <p className="text-[10px] text-zinc-400">Consolidated Risk</p>
          </div>
        </div>
      </Card>

      {/* risk radar (6 domains) */}
      <Card>
        <SectionHeader title="📊 Risk Domain Scorecard (0=ปลอดภัย · 100=เสี่ยงสูง)" />
        <div className="flex items-center gap-6 flex-wrap">
          <Radar scores={a.scores || {}} />
          <div className="flex-1 space-y-1.5 min-w-[260px]">
            {['data', 'model', 'ethical', 'cyber', 'vendor', 'agentic'].map(d => (
              <div key={d} className="flex items-center gap-2">
                <span className="w-20 text-[11px] text-zinc-600">{DOMAIN_LABEL[d]}</span>
                <input type="range" min={0} max={100} value={a.scores?.[d] ?? 0} onChange={e => setScore(d, +e.target.value)} className="flex-1" />
                <span className="w-8 text-right text-[11px] font-medium" style={{ color: scoreColor(a.scores?.[d] ?? 0) }}>{a.scores?.[d] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 21-step stepper by phase */}
      {phases.map((ph: any) => (
        <Card key={ph.id}>
          <SectionHeader title={ph.label} />
          <div className="space-y-1.5">
            {stepDefs.filter((s: any) => s.phase === ph.id).map((s: any) => {
              const st = stepState(s.no)
              const [col, icon] = stStyle(st.status)
              const isEd = editStep === s.no
              return (
                <div key={s.no} className="border border-zinc-100 rounded-lg">
                  <div className="flex items-center gap-2 p-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: col + '22', color: col }}>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-zinc-800">{s.no}. {s.name}</div>
                      <div className="text-[10px] text-zinc-400">{s.responsible} · 📄 {s.deliverable}{st.notes ? ` · ${st.notes}` : ''}</div>
                    </div>
                    {s.no === 13 ? (
                      <div className="flex gap-1">
                        {['approved', 'conditional', 'rejected'].map(d => <button key={d} onClick={() => decide(d)} className="glass-btn-soft text-[9px] px-1.5 py-0.5 rounded capitalize">{d}</button>)}
                      </div>
                    ) : isEd ? (
                      <button onClick={() => saveStep(s.no)} className="glass-btn-primary text-[10px] px-2 py-0.5 rounded">บันทึก</button>
                    ) : (
                      <button onClick={() => { setEditStep(s.no); setDraft({ status: 'completed', notes: st.notes, evidence: st.evidence }) }} title="กรอก deliverable" className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">✏️</button>
                    )}
                  </div>
                  {isEd && (
                    <div className="px-2 pb-2 flex gap-2">
                      <select value={draft.status} onChange={e => setDraft((d: any) => ({ ...d, status: e.target.value }))} className="text-[11px] px-1.5 py-1 border border-zinc-200 rounded"><option value="completed">เสร็จ</option><option value="in_progress">กำลังทำ</option><option value="skipped">ข้าม</option></select>
                      <input placeholder="หมายเหตุ/deliverable" value={draft.notes ?? ''} onChange={e => setDraft((d: any) => ({ ...d, notes: e.target.value }))} className="flex-1 text-[11px] px-2 py-1 border border-zinc-200 rounded" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Guardrails checklist inside implementation phase */}
            {ph.id === 'implementation' && (
              <div className="mt-2 p-2 bg-zinc-50 rounded-lg">
                <div className="text-[11px] font-medium text-zinc-500 mb-1">🛡️ Guardrails & AI-IRP</div>
                <div className="grid grid-cols-2 gap-1">
                  {(a.guardrails || []).map((g: any, i: number) => (
                    <label key={g.key} className="flex items-center gap-2 text-[11px] text-zinc-600"><input type="checkbox" checked={g.enabled} onChange={() => toggleGuardrail(i)} /> {g.label}</label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* P4 — Integrations & Lifecycle */}
      <Card>
        <SectionHeader title="🔗 Integrations & Lifecycle" />
        <div className="grid grid-cols-2 gap-3">
          {/* Vendor (Step 10) */}
          <div>
            <div className="text-[11px] text-zinc-500 mb-1">🏢 Vendor (Step 10)</div>
            <select value={a.vendor_id ?? ''} onChange={e => post('link-vendor', { vendor_id: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded">
              <option value="">— เลือก vendor —</option>
              {(Array.isArray(vendors) ? vendors : []).map((v: any) => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
            </select>
            {links?.vendor && <div className="text-[10px] text-zinc-500 mt-1">{links.vendor.name} · risk {links.vendor.risk_level}</div>}
          </div>
          {/* Training (Step 16) */}
          <div>
            <div className="text-[11px] text-zinc-500 mb-1">🎓 Training (Step 16)</div>
            <select value={a.training_course_id ?? ''} onChange={e => post('link-training', { training_course_id: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded">
              <option value="">— เลือกหลักสูตร —</option>
              {(Array.isArray(courses) ? courses : []).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {/* Risk (Step 12) */}
          <div>
            <div className="text-[11px] text-zinc-500 mb-1">⚠️ Risk Register (Step 12)</div>
            {links?.risk
              ? <Link href="/governance/risk" className="text-xs text-blue-600 hover:underline">{links.risk.risk_id} — {links.risk.title} (score {links.risk.score})</Link>
              : <button onClick={() => post('create-risk')} className="glass-btn-soft text-[10px] px-2 py-1 rounded">+ สร้าง Risk จาก assessment</button>}
          </div>
          {/* Lifecycle */}
          <div>
            <div className="text-[11px] text-zinc-500 mb-1">🚀 Lifecycle</div>
            <div className="flex gap-1">
              {a.status !== 'live' && <button onClick={() => post('go-live')} className="glass-btn-primary text-[10px] px-2 py-1 rounded">Go-Live (18)</button>}
              {a.status !== 'retired' && <button onClick={() => post('retire', {})} className="glass-btn-danger text-[10px] px-2 py-1 rounded">Retire / EoL (21)</button>}
            </div>
            {a.go_live_at && <div className="text-[10px] text-zinc-400 mt-1">live: {new Date(a.go_live_at).toLocaleDateString('th-TH')}</div>}
          </div>
          {/* AI-IRP (Step 17) */}
          <div className="col-span-2">
            <div className="text-[11px] text-zinc-500 mb-1">🆘 AI Incident Response Plan / Kill Switch (Step 17)</div>
            <textarea defaultValue={a.airp ?? ''} onBlur={e => saveField({ airp: e.target.value })} rows={2} placeholder="ระบุแผนเผชิญเหตุ Kill Switch / Fallback..." className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
          </div>
          {/* Monitoring (Step 19) */}
          <div className="col-span-2">
            <div className="text-[11px] text-zinc-500 mb-1">📡 Monitoring Notes (Step 19)</div>
            <textarea defaultValue={a.monitoring_notes ?? ''} onBlur={e => saveField({ monitoring_notes: e.target.value })} rows={2} placeholder="บันทึกการเฝ้าระวัง / policy violations / model drift..." className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
          </div>
        </div>
      </Card>

      {a.decision && (
        <Card><SectionHeader title="⚖️ Approval" />
          <p className="text-xs text-zinc-700">{a.decision}{a.conditions ? ` — เงื่อนไข: ${a.conditions}` : ''}</p>
          {a.decided_at && <p className="text-[10px] text-zinc-400 mt-1">{new Date(a.decided_at).toLocaleString('th-TH')}</p>}
        </Card>
      )}
    </div>
  )
}

/* 6-axis radar chart */
function Radar({ scores }: { scores: Record<string, number> }) {
  const domains = ['data', 'model', 'ethical', 'cyber', 'vendor', 'agentic']
  const cx = 90, cy = 90, R = 70
  const pt = (i: number, r: number) => {
    const ang = (Math.PI * 2 * i / domains.length) - Math.PI / 2
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]
  }
  const poly = domains.map((d, i) => pt(i, (scores[d] ?? 0) / 100 * R)).map(p => p.join(',')).join(' ')
  return (
    <svg viewBox="0 0 180 180" className="w-44 h-44 flex-shrink-0">
      {[0.33, 0.66, 1].map((f, k) => <polygon key={k} points={domains.map((_, i) => pt(i, R * f).join(',')).join(' ')} fill="none" stroke="#e4e4e7" strokeWidth="0.5" />)}
      {domains.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e4e4e7" strokeWidth="0.5" /> })}
      <polygon points={poly} fill="#1d4ed8" fillOpacity="0.18" stroke="#1d4ed8" strokeWidth="1.5" />
      {domains.map((d, i) => { const [x, y] = pt(i, R + 8); return <text key={d} x={x} y={y} fontSize="7" fill="#71717a" textAnchor="middle" dominantBaseline="middle">{DOMAIN_LABEL[d]}</text> })}
    </svg>
  )
}
