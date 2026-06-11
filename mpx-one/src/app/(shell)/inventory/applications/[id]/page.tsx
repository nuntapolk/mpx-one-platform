'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Card, SectionHeader, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const BCG = { invest: ['#dcfce7', '#15803d', 'Invest'], tolerate: ['#eff6ff', '#1d4ed8', 'Tolerate'], migrate: ['#fef3c7', '#d97706', 'Migrate'], eliminate: ['#fee2e2', '#c0272d', 'Eliminate'] } as any
const riskColor = (r: string) => (({ low: '#15803d', medium: '#d97706', high: '#c0272d', critical: '#7f1d1d' } as any)[r] || '#64748b')
const healthColor = (h: number) => h >= 75 ? '#15803d' : h >= 50 ? '#d97706' : '#c0272d'
const fmtTco = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n || 0)

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSWR(`${API}/api/v1/applications/${id}/360`, fetcher)

  if (isLoading) return <div className="py-10 text-center text-xs text-zinc-400">กำลังโหลด...</div>
  if (!data?.application) return <Card><Empty message="ไม่พบ Application" /></Card>

  const a = data.application
  const apm = data.apm || {}
  const c = data.compliance || {}
  const pdpa = data.pdpa || {}

  const Gauge = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="text-center">
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${color} ${(value || 0) * 3.6}deg, #f1f5f9 0deg)` }}>
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sm font-bold" style={{ color }}>{value ?? '—'}</div>
      </div>
      <div className="text-[10px] text-zinc-500 mt-1">{label}</div>
    </div>
  )
  const Flag = ({ on, label, color }: { on: boolean; label: string; color: string }) => (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: on ? color + '22' : '#f4f4f5', color: on ? color : '#a1a1aa' }}>{on ? '✓ ' : '— '}{label}</span>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/inventory/applications" className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg">← Portfolio</Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-800">{a.application_name}</h1>
          <p className="text-[11px] text-zinc-400 font-mono">{a.application_code} · {a.application_type || '—'} · {(a.lifecycle_status || '').replace(/_/g, ' ')}</p>
        </div>
        {a.bcg_classification && <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{ background: BCG[a.bcg_classification]?.[0], color: BCG[a.bcg_classification]?.[1] }}>{BCG[a.bcg_classification]?.[2]}</span>}
      </div>

      {/* Alerts */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <div className="text-xs font-medium text-amber-800 mb-1">⚠️ ข้อควรระวัง</div>
          <div className="flex flex-wrap gap-2">{data.alerts.map((al: string, i: number) => <span key={i} className="text-[11px] text-amber-700">• {al}</span>)}</div>
        </div>
      )}

      {/* APM scorecard */}
      <Card>
        <SectionHeader title="📊 Portfolio (APM)" />
        <div className="flex items-center gap-8 flex-wrap">
          <Gauge label="Health" value={apm.health} color={healthColor(apm.health ?? 0)} />
          <Gauge label="Tech Debt" value={apm.tech_debt} color={apm.tech_debt >= 70 ? '#c0272d' : '#d97706'} />
          <Gauge label="Strategic" value={apm.strategic} color="#1d4ed8" />
          <div className="space-y-1 text-sm">
            <div className="flex gap-2"><span className="text-zinc-500 w-24">TCO/ปี:</span><span className="font-semibold">฿{fmtTco(Number(apm.tco) || 0)}</span></div>
            <div className="flex gap-2"><span className="text-zinc-500 w-24">Criticality:</span><span className="font-semibold capitalize">{apm.criticality}</span></div>
            <div className="flex gap-2"><span className="text-zinc-500 w-24">Users:</span><span className="font-semibold">{a.users_count ?? '—'}</span></div>
            <div className="flex gap-2"><span className="text-zinc-500 w-24">EA Group:</span><span className="font-semibold">{a.ea_group ?? '—'}</span></div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Compliance lens */}
        <Card>
          <SectionHeader title="🔐 Compliance & Governance" />
          <div className="flex flex-wrap gap-2">
            <Flag on={c.pdpa} label="PDPA (PII)" color="#1d4ed8" />
            <Flag on={c.sensitive} label="ข้อมูลอ่อนไหว" color="#c0272d" />
            <Flag on={c.iso} label="ISO 27001" color="#15803d" />
            <Flag on={c.oic} label="OIC" color="#7c3aed" />
            <Flag on={c.ai} label="AI" color="#7c3aed" />
            <Flag on={c.internet_facing} label="Internet-facing" color="#d97706" />
          </div>
        </Card>

        {/* Operations */}
        <Card>
          <SectionHeader title="🔧 Operations & Tech" />
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <Kv k="Hosting" v={a.hosting_type} /><Kv k="Environment" v={a.environment} />
            <Kv k="OS" v={a.os_platform} /><Kv k="Database" v={a.db_platform} />
            <Kv k="Support" v={a.support_model} /><Kv k="Service" v={a.service_hours} />
            <Kv k="DR" v={a.dr_enabled ? 'มี' : 'ไม่มี'} /><Kv k="EOL" v={a.eol_date} />
          </div>
        </Card>
      </div>

      {/* PDPA / ROPA lens */}
      <Card>
        <SectionHeader title="⚖️ PDPA — Records of Processing (ROPA)" action={<Link href="/inventory/ropa" className="text-xs text-blue-600 hover:underline">ดู ROPA ทั้งหมด</Link>} />
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Mini label="ROPA ผูกกับแอป" value={pdpa.count} />
          <Mini label="ต้องทำ DPIA" value={pdpa.dpia_required} variant="warn" />
          <Mini label="โอนข้ามพรมแดน" value={pdpa.cross_border} variant="warn" />
          <Mini label="ความเสี่ยงสูง" value={pdpa.high_risk} variant="danger" />
        </div>
        {Array.isArray(pdpa.items) && pdpa.items.length > 0 ? (
          <div className="space-y-1">
            {pdpa.items.map((r: any) => (
              <Link key={r.id} href={`/inventory/ropa/${r.id}`} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-zinc-50 border-b border-zinc-100 last:border-0">
                <span className="font-mono text-[10px] text-zinc-400">{r.code}</span>
                <span className="text-zinc-700 flex-1 truncate">{r.name}</span>
                {r.dpia_required && <span className="text-[9px] px-1.5 rounded bg-amber-50 text-amber-700">DPIA</span>}
                {r.risk && <span className="text-[9px] px-1.5 rounded-full font-medium" style={{ background: riskColor(r.risk) + '22', color: riskColor(r.risk) }}>{r.risk}</span>}
              </Link>
            ))}
          </div>
        ) : <Empty message="ยังไม่มี ROPA ผูกกับแอปนี้" />}
      </Card>

      {/* Vendor */}
      {data.vendor && (
        <Card>
          <SectionHeader title="🏢 Vendor" />
          <div className="text-sm"><span className="font-medium text-zinc-800">{data.vendor.name}</span> <span className="text-[10px] font-mono text-zinc-400 ml-2">{data.vendor.code}</span></div>
        </Card>
      )}
    </div>
  )
}

function Kv({ k, v }: { k: string; v: any }) {
  return <><span className="text-zinc-400">{k}</span><span className="text-zinc-700">{v || '—'}</span></>
}
function Mini({ label, value, variant }: { label: string; value: any; variant?: string }) {
  const color = variant === 'danger' ? '#c0272d' : variant === 'warn' ? '#d97706' : '#1e293b'
  return (
    <div className="rounded-lg border border-zinc-200 p-2 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value ?? 0}</div>
      <div className="text-[10px] text-zinc-400">{label}</div>
    </div>
  )
}
