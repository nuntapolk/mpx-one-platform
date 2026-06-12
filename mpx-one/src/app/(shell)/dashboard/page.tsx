'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, SectionHeader, KPICard, ProgressBar } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

function riskScoreColor(s: number) {
  if (s >= 20) return '#E24B4A'
  if (s >= 12) return '#EF9F27'
  if (s >= 6)  return '#F59E0B'
  return '#10B981'
}

const SEV_STYLE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700',
  medium: 'bg-yellow-50 text-yellow-700', low: 'bg-green-50 text-green-700',
}

export default function DashboardPage() {
  const { data: exec, isLoading } = useSWR(`${API}/api/v1/dashboard/summary`, fetcher)
  const { data: ops }  = useSWR(`${API}/api/v1/dashboard/operations`, fetcher)

  const score = exec?.overall_score ?? 0
  const scoreColor = score >= 80 ? '#1D9E75' : score >= 60 ? '#EF9F27' : '#E24B4A'
  const scoreLabel = score >= 80 ? 'Satisfactory' : score >= 60 ? 'Needs Improvement' : 'At Risk'

  return (
    <div className="space-y-4">
      {/* Score hero */}
      <div className="grid grid-cols-5 gap-3">
        {/* Overall score card */}
        <div className="col-span-1 bg-white border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center">
          <p className="text-xs text-zinc-500 mb-1">Overall Governance Score</p>
          <div className="text-5xl font-bold" style={{ color: scoreColor }}>{isLoading ? '—' : score}</div>
          <p className="text-xs font-medium mt-1" style={{ color: scoreColor }}>{isLoading ? '' : scoreLabel}</p>
        </div>

        {/* KPI row */}
        <KPICard label="Open Risks"      value={exec?.kpis?.risks?.open ?? '—'} sub={`${exec?.kpis?.risks?.high ?? 0} high/critical`} subVariant="danger" />
        <KPICard label="Open Issues"     value={exec?.kpis?.issues?.open ?? '—'} sub={`${exec?.kpis?.issues?.critical ?? 0} critical`} subVariant="danger" />
        <KPICard label="Assessment ผ่าน" value={exec?.kpis?.assessments?.approved ?? '—'} sub={`จาก ${exec?.kpis?.assessments?.total ?? 0} รายการ`} subVariant="up" />
        <KPICard label="Overdue Actions" value={exec?.kpis?.actions?.overdue ?? '—'} subVariant={exec?.kpis?.actions?.overdue > 0 ? 'danger' : undefined} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Governance scores by module */}
        <Card>
          <SectionHeader title="Governance Module Scores" />
          {(exec?.governance_modules ?? [
            { name: 'Risk Management', score: 0, color: '#EF9F27' },
            { name: 'Assessments', score: 0, color: '#378ADD' },
            { name: 'Evidence Coverage', score: 0, color: '#1D9E75' },
            { name: 'Issue Resolution', score: 0, color: '#7F77DD' },
          ]).map((m: any) => (
            <ProgressBar key={m.name} label={m.name} value={m.score} color={m.color} />
          ))}
        </Card>

        {/* Operations panel */}
        <Card>
          <SectionHeader title="Governance Operations Status" />
          <div className="space-y-0 divide-y divide-zinc-100">
            {[
              { label: 'Assessments in progress',      value: ops?.assessments?.in_progress, link: '/assessments' },
              { label: 'Assessments overdue',           value: ops?.assessments?.overdue,     warn: true, link: '/assessments' },
              { label: 'Evidence pending review',       value: ops?.evidences?.pending_review, link: '/evidences' },
              { label: 'Issues pending closure',        value: ops?.issues?.pending_closure,  link: '/issues' },
              { label: 'Action plans overdue',          value: ops?.actions?.overdue,         warn: true, link: '/issues' },
              { label: 'Active frameworks',             value: ops?.frameworks?.active,       link: '/frameworks' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-xs text-zinc-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${item.warn && item.value > 0 ? 'text-red-600' : 'text-zinc-800'}`}>
                    {item.value ?? '—'}
                  </span>
                  {item.link && <Link href={item.link} title="ดูรายละเอียด" className="text-[11px] text-blue-500 hover:text-blue-700">🔍</Link>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Top risks + High issues */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Top Risks" action={
            <Link href="/governance/risk" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</Link>
          } />
          {(exec?.top_risks ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {(exec?.top_risks ?? []).map((r: any) => (
                <div key={r.id} className="flex items-center gap-2 py-2">
                  <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: riskScoreColor(r.score) }}>
                    {r.score}
                  </div>
                  <span className="flex-1 text-xs text-zinc-700 truncate">{r.title}</span>
                  <span className="text-[10px] text-zinc-400">{r.category?.replace('_risk', '')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="Critical/High Issues" action={
            <Link href="/issues" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</Link>
          } />
          {(exec?.high_issues ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {(exec?.high_issues ?? []).map((i: any) => (
                <div key={i.id} className="flex items-center gap-2 py-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${SEV_STYLE[i.severity] ?? ''}`}>
                    {i.severity}
                  </span>
                  <span className="flex-1 text-xs text-zinc-700 truncate">{i.title}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Evidence + Controls summary */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard label="Evidences (Accepted)" value={exec?.kpis?.evidences?.accepted ?? '—'} sub={`จาก ${exec?.kpis?.evidences?.total ?? 0} รายการ`} subVariant="up" />
        <KPICard label="Expiring Evidence"    value={exec?.kpis?.evidences?.expiring ?? '—'} sub="ภายใน 30 วัน" subVariant={exec?.kpis?.evidences?.expiring > 0 ? 'danger' : undefined} />
        <KPICard label="Controls Active"      value={exec?.kpis?.controls?.total ?? '—'} sub="Unified Control Library" />
      </div>
    </div>
  )
}
