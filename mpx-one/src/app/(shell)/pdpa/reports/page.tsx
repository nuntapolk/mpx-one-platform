'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Card, KPICard, SectionHeader, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TABS = [
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'governance', label: '📑 Governance Report' },
  { id: 'repository', label: '🗄️ Repository' },
]
const PALETTE = ['#15803d', '#1d4ed8', '#d97706', '#7c3aed', '#0369a1', '#c0272d', '#64748b', '#0891b2']
const riskColor = (r: string) => (({ low: '#15803d', medium: '#d97706', high: '#c0272d', critical: '#7f1d1d' } as any)[r] || '#64748b')

function scoreColor(v: number) { return v >= 80 ? '#15803d' : v >= 60 ? '#d97706' : '#c0272d' }

/* Horizontal bar chart from a {label:count} map */
function BarChart({ data, colorMap }: { data: Record<string, number>; colorMap?: (k: string) => string }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(e => e[1]))
  if (entries.length === 0) return <Empty message="ไม่มีข้อมูล" />
  return (
    <div className="space-y-2">
      {entries.map(([k, v], i) => (
        <div key={k} className="flex items-center gap-2">
          <div className="w-32 text-xs text-zinc-500 truncate capitalize" title={k}>{String(k).replace(/_/g, ' ')}</div>
          <div className="flex-1 h-5 bg-zinc-100 rounded overflow-hidden">
            <div className="h-full rounded flex items-center justify-end pr-2 text-[10px] text-white font-medium transition-all"
              style={{ width: `${Math.max(8, v / max * 100)}%`, background: colorMap ? colorMap(k) : PALETTE[i % PALETTE.length] }}>
              {v}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* Mini line/area trend (12 months) */
function TrendChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) return <Empty message="ไม่มีข้อมูล" />
  const vals = entries.map(e => e[1])
  const max = Math.max(1, ...vals)
  const W = 100, H = 36
  const pts = entries.map(([, v], i) => `${(i / (entries.length - 1 || 1)) * W},${H - (v / max) * H}`).join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-16">
        <polyline points={pts} fill="none" stroke="#15803d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill="#15803d" opacity="0.08" />
      </svg>
      <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
        <span>{entries[0][0]}</span><span>รวม {vals.reduce((a, b) => a + b, 0)}</span><span>{entries[entries.length - 1][0]}</span>
      </div>
    </div>
  )
}

export default function Page() {
  const { data, isLoading } = useSWR(`${API}/api/v1/reports`, fetcher)
  const [tab, setTab] = useState('analytics')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">📈 Reports & Analytics</h1>
          <p className="text-xs text-zinc-500 mt-0.5">รายงานภาพรวม compliance ข้ามทุก module {data?.generated_at && `· ${new Date(data.generated_at).toLocaleString('th-TH')}`}</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-zinc-100/60">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${tab === t.id ? 'glass-btn-primary' : 'glass-btn-soft'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? <Card><div className="py-10 text-center text-xs text-zinc-400">กำลังโหลด...</div></Card> : (
        <>
          {tab === 'analytics' && <Analytics a={data.analytics} />}
          {tab === 'governance' && <Governance g={data.governance} />}
          {tab === 'repository' && <RepositoryView r={data.repository} />}
        </>
      )}
    </div>
  )
}

/* ── ANALYTICS ─────────────────────────────────────────────── */
function Analytics({ a }: { a: any }) {
  const k = a.kpis || {}
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ROPA ทั้งหมด" value={k.ropa_total} sub={`active ${k.ropa_active}`} />
        <KPICard label="Risk วิกฤต/สูง" value={`${k.risk_critical}/${k.risk_high}`} subVariant="danger" sub="critical / high" />
        <KPICard label="DSAR ค้าง/เกินกำหนด" value={`${k.dsr_pending}/${k.dsr_overdue}`} subVariant="warn" sub="pending / overdue" />
        <KPICard label="Breach / DPIA req." value={`${k.breach_total}/${k.dpia_required}`} sub="breach / dpia req" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card><SectionHeader title="ROPA ตามสถานะ" /><BarChart data={a.ropa_by_status} /></Card>
        <Card><SectionHeader title="ROPA ตามฐานทางกฎหมาย" /><BarChart data={a.ropa_by_lawful} /></Card>
        <Card><SectionHeader title="ROPA ตามความเสี่ยง" /><BarChart data={a.ropa_by_risk} colorMap={riskColor} /></Card>
        <Card><SectionHeader title="Risk ตามระดับ" /><BarChart data={a.risk_by_level} colorMap={riskColor} /></Card>
        <Card><SectionHeader title="DSAR ตามประเภท" /><BarChart data={a.dsr_by_type} /></Card>
        <Card><SectionHeader title="DSAR ตามสถานะ" /><BarChart data={a.dsr_by_status} /></Card>
        <Card><SectionHeader title="Breach ตามความรุนแรง" /><BarChart data={a.breach_by_severity} colorMap={riskColor} /></Card>
        <Card><SectionHeader title="DPIA ตามสถานะ" /><BarChart data={a.dpia_by_status} /></Card>
        <Card><SectionHeader title="แนวโน้ม ROPA (12 เดือน)" /><TrendChart data={a.ropa_trend} /></Card>
        <Card><SectionHeader title="แนวโน้ม Risk (12 เดือน)" /><TrendChart data={a.risk_trend} /></Card>
      </div>
    </div>
  )
}

/* ── GOVERNANCE REPORT ─────────────────────────────────────── */
function Governance({ g }: { g: any }) {
  const cs = g.compliance_score ?? 0
  const Stat = ({ label, value, variant }: { label: string; value: any; variant?: string }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold" style={{ color: variant === 'danger' ? '#c0272d' : variant === 'warn' ? '#d97706' : '#1e293b' }}>{value}</span>
    </div>
  )
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${scoreColor(cs)} ${cs * 3.6}deg, #f1f5f9 0deg)` }}>
              <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: scoreColor(cs) }}>{cs}</span>
                <span className="text-[10px] text-zinc-400">/ 100</span>
              </div>
            </div>
            <div className="text-xs text-zinc-500 mt-2 font-medium">Compliance Score</div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-zinc-800">📑 Executive Governance Report</h2>
            <p className="text-xs text-zinc-500 mt-1">สรุปภาพรวมการกำกับดูแล PDPA รายเดือน — พิมพ์/บันทึก PDF ได้จากเบราว์เซอร์ (Cmd+P)</p>
            <button onClick={() => window.print()} className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg mt-3">🖨️ Print / Save PDF</button>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <SectionHeader title="📋 ROPA" />
          <Stat label="ทั้งหมด" value={g.ropa.total} />
          <Stat label="วิกฤต/สูง" value={g.ropa.critical} variant="warn" />
          <Stat label="ต้องทำ DPIA" value={g.ropa.dpia_required} />
        </Card>
        <Card>
          <SectionHeader title="⚖️ DSAR" />
          <Stat label="ทั้งหมด" value={g.dsar.total} />
          <Stat label="ค้าง" value={g.dsar.pending} variant="warn" />
          <Stat label="เกินกำหนด" value={g.dsar.overdue} variant="danger" />
          <Stat label="SLA on-time" value={g.dsar.sla_rate != null ? `${g.dsar.sla_rate}%` : '—'} />
        </Card>
        <Card>
          <SectionHeader title="⚡ Breach" />
          <Stat label="ทั้งหมด" value={g.breach.total} />
          <Stat label="เปิดอยู่" value={g.breach.open} variant="warn" />
          <Stat label="เกิน 72 ชม." value={g.breach.overdue_72h} variant="danger" />
        </Card>
        <Card>
          <SectionHeader title="◑ DPIA" />
          <Stat label="ทั้งหมด" value={g.dpia.total} />
          <Stat label="อนุมัติแล้ว" value={g.dpia.approved} />
          <Stat label="ค้างพิจารณา" value={g.dpia.pending} variant="warn" />
        </Card>
        <Card>
          <SectionHeader title="✍️ Consent" />
          <Stat label="ใช้งานอยู่" value={g.consent.active} />
          <Stat label="ทั้งหมด" value={g.consent.total} />
        </Card>
        <Card>
          <SectionHeader title="🎓 Training" />
          <Stat label="หลักสูตร" value={g.training.courses} />
          <Stat label="ผ่านแล้ว (คน)" value={g.training.completed_users} />
        </Card>
      </div>
      <Card>
        <SectionHeader title="⚠️ Risk ตามระดับ" />
        <BarChart data={g.risk} colorMap={riskColor} />
      </Card>
    </div>
  )
}

/* ── REPOSITORY ────────────────────────────────────────────── */
function RepositoryView({ r }: { r: any }) {
  const rows: { module: string; cells: { label: string; value: any; variant?: string }[] }[] = [
    { module: '📋 ROPA', cells: [{ label: 'total', value: r.ropa.total }, { label: 'active', value: r.ropa.active }, { label: 'draft', value: r.ropa.draft }, { label: 'dpia req', value: r.ropa.dpia_req }] },
    { module: '◑ DPIA', cells: [{ label: 'total', value: r.dpia.total }, { label: 'approved', value: r.dpia.approved }, { label: 'pending', value: r.dpia.pending, variant: 'warn' }] },
    { module: '⚠️ Risk', cells: [{ label: 'total', value: r.risk.total }, { label: 'critical', value: r.risk.critical, variant: 'danger' }, { label: 'high', value: r.risk.high, variant: 'warn' }, { label: 'accepted', value: r.risk.accepted }] },
    { module: '⚖️ DSAR', cells: [{ label: 'total', value: r.dsar.total }, { label: 'pending', value: r.dsar.pending, variant: 'warn' }, { label: 'overdue', value: r.dsar.overdue, variant: 'danger' }] },
    { module: '⚡ Breach', cells: [{ label: 'total', value: r.breach.total }, { label: 'open', value: r.breach.open, variant: 'warn' }, { label: 'overdue 72h', value: r.breach.overdue_72h, variant: 'danger' }] },
    { module: '✍️ Consent', cells: [{ label: 'active', value: r.consent.active }, { label: 'total', value: r.consent.total }] },
    { module: '🎓 Training', cells: [{ label: 'courses', value: r.training.courses }, { label: 'completed users', value: r.training.completed_users }] },
  ]
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">🗄️ Enterprise Repository — สรุป compliance ข้ามทุก module ในที่เดียว</p>
      {rows.map(row => (
        <Card key={row.module}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-32 font-semibold text-sm text-zinc-800">{row.module}</div>
            <div className="flex gap-6 flex-wrap">
              {row.cells.map(c => (
                <div key={c.label} className="text-center">
                  <div className="text-lg font-bold" style={{ color: c.variant === 'danger' ? '#c0272d' : c.variant === 'warn' ? '#d97706' : '#1e293b' }}>{c.value}</div>
                  <div className="text-[10px] text-zinc-400 capitalize">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
