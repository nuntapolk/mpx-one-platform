'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, SectionHeader, ProgressBar, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : null)

const COLORS: Record<string, string> = { excellent: '#15803d', good: '#1D63B0', fair: '#d97706', poor: '#c0272d' }
const SEV: Record<string, [string, string]> = {
  critical: ['#fef2f2', '#c0272d'], high: ['#fff7ed', '#d97706'], medium: ['#fefce8', '#a16207'], low: ['#f0fdf4', '#15803d'],
}
const statusOf = (s: number) => s >= 85 ? 'excellent' : s >= 70 ? 'good' : s >= 50 ? 'fair' : 'poor'

function Donut({ value }: { value: number }) {
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - value / 100)
  return (
    <svg width="84" height="84" viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke={COLORS[statusOf(value)]} strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle" fontSize="20" fontWeight="600" fill={COLORS[statusOf(value)]}>{value}%</text>
    </svg>
  )
}

function Hero({ label, value, desc }: { label: string; value: number; desc: string }) {
  return (
    <Card>
      <div className="text-xs text-zinc-500 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <Donut value={value} />
        <div>
          <div className="text-sm font-semibold capitalize" style={{ color: COLORS[statusOf(value)] }}>{statusOf(value)}</div>
          <div className="text-[11px] text-zinc-500 leading-tight mt-0.5">{desc}</div>
        </div>
      </div>
    </Card>
  )
}

export default function ReadinessPage() {
  const { data: ov } = useSWR(`${API}/api/v1/readiness/overview`, fetcher)
  const { data: comp } = useSWR(`${API}/api/v1/readiness/components`, fetcher)
  const { data: mods } = useSWR(`${API}/api/v1/readiness/modules`, fetcher)
  const { data: gaps } = useSWR(`${API}/api/v1/readiness/gaps`, fetcher)
  const { data: units } = useSWR(`${API}/api/v1/readiness/units`, fetcher)
  const { data: acts } = useSWR(`${API}/api/v1/readiness/actions`, fetcher)

  const o = ov?.data
  const meta = ov?.meta

  return (
    <div className="space-y-4">
      {/* Filters (MVP: period display) */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="px-2.5 py-1.5 rounded-lg bg-white/60 border border-white/60">📅 {meta?.scope?.assessment_period || '—'}</span>
        <span className="px-2.5 py-1.5 rounded-lg bg-white/60 border border-white/60">Profile: Enterprise</span>
        <span className="flex-1" />
        <span className="text-[11px] text-zinc-400">methodology {meta?.methodology_version} · {meta?.calculated_at ? new Date(meta.calculated_at).toLocaleString('en-GB') : ''}</span>
      </div>

      {/* 4 hero score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Hero label="Overall PDPA Readiness" value={o?.overall_score ?? 0} desc="ภาพรวมความพร้อมทั้งองค์กร" />
        <Hero label="Compliance Coverage" value={o?.compliance_score ?? 0} desc="ความครบของข้อมูล/เอกสาร" />
        <Hero label="Control & Evidence" value={o?.control_evidence_score ?? 0} desc="มาตรการ + หลักฐาน" />
        <Hero label="Operational Readiness" value={o?.operational_score ?? 0} desc="ความพร้อมเชิงปฏิบัติการ" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Score composition */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Score Composition (Weighted)" />
          {!comp?.data?.length ? <Empty /> : comp.data.map((c: any) => (
            <ProgressBar key={c.component_code} label={`${c.component_name} (${c.weight_percent}%)`} value={c.raw_score} color={COLORS[c.status] || '#1D63B0'} />
          ))}
        </Card>

        {/* Gap summary */}
        <Card>
          <SectionHeader title="Gap Summary" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(['critical', 'high', 'medium', 'low'] as const).map(s => (
              <div key={s} className="rounded-lg px-3 py-2 text-center" style={{ background: SEV[s][0] }}>
                <div className="text-lg font-bold" style={{ color: SEV[s][1] }}>{o?.summary?.[`${s}_gaps`] ?? 0}</div>
                <div className="text-[10px] capitalize" style={{ color: SEV[s][1] }}>{s}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {(gaps?.data?.top_gaps || []).slice(0, 5).map((g: any) => (
              <div key={g.id} className="flex items-center gap-2 text-[11px] py-1 border-b border-white/40 last:border-0">
                <span className="px-1.5 rounded-full font-bold uppercase text-[9px]" style={{ background: SEV[g.severity]?.[0], color: SEV[g.severity]?.[1] }}>{g.severity}</span>
                <span className="flex-1 truncate text-zinc-700">{g.title}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Module compliance matrix */}
      <Card>
        <SectionHeader title="Module Compliance Matrix" />
        {!mods?.data?.length ? <Empty /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {mods.data.map((m: any) => (
              <div key={m.module_code} className="rounded-lg border border-white/60 bg-white/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-700">{m.module_name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[m.status] }} />
                </div>
                <div className="text-lg font-bold" style={{ color: COLORS[m.status] }}>{m.score}%</div>
                <div className="text-[10px] text-zinc-400">{m.completed_count}/{m.total_count} complete</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Unit readiness */}
        <div>
          <SectionHeader title="Organization / Unit Readiness" />
          <TableWrap>
            <table className="w-full text-xs">
              <thead><tr><Th>Unit</Th><Th>Score</Th><Th>Open</Th><Th>Overdue</Th><Th>Risk</Th></tr></thead>
              <tbody>
                {!units?.data?.length ? (
                  <tr><Td className="text-zinc-400">ยังไม่มีหน่วยงาน (เพิ่ม Business Unit เพื่อดู readiness รายหน่วย)</Td></tr>
                ) : units.data.map((u: any) => (
                  <tr key={u.organization_unit_id}>
                    <Td>{u.organization_unit_name}</Td>
                    <Td><span className="font-semibold" style={{ color: COLORS[statusOf(u.readiness_score)] }}>{u.readiness_score}%</span></Td>
                    <Td>{u.open_actions}</Td><Td>{u.overdue_actions}</Td>
                    <Td><span className="capitalize">{u.risk_status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>

        {/* Evidence & Actions */}
        <Card>
          <SectionHeader title="Evidence & Actions Summary" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-white/50 p-3"><div className="text-[11px] text-zinc-500">Open Actions</div><div className="text-xl font-bold text-zinc-800">{acts?.data?.summary?.open_actions ?? 0}</div></div>
            <div className="rounded-lg bg-white/50 p-3"><div className="text-[11px] text-zinc-500">Overdue Actions</div><div className="text-xl font-bold text-[#c0272d]">{acts?.data?.summary?.overdue_actions ?? 0}</div></div>
          </div>
          <div className="text-xs font-medium text-zinc-600 mb-1">Next Priority Actions</div>
          <div className="space-y-1">
            {(acts?.data?.priority_actions || []).slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 text-[11px] py-1 border-b border-white/40 last:border-0">
                <span className="px-1.5 rounded-full font-bold uppercase text-[9px]" style={{ background: SEV[a.priority]?.[0], color: SEV[a.priority]?.[1] }}>{a.priority}</span>
                <span className="flex-1 truncate text-zinc-700">{a.title}</span>
                {a.due_date && <span className="text-zinc-400">{String(a.due_date).slice(0, 10)}</span>}
              </div>
            ))}
            {!(acts?.data?.priority_actions || []).length && <Empty message="ไม่มี action" />}
          </div>
        </Card>
      </div>
    </div>
  )
}
