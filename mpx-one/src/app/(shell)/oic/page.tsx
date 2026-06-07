'use client'
import useSWR from 'swr'
import { Card, SectionHeader, KPICard, ProgressBar, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url).then(r => r.json())

function pctColor(p: number) {
  if (p >= 80) return '#1D9E75'
  if (p >= 50) return '#EF9F27'
  return '#E24B4A'
}

const CRIT_STYLE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-50 text-blue-700', low: 'bg-green-50 text-green-700',
}

export default function OicPage() {
  const { data: rd } = useSWR(`${API}/api/v1/oic/readiness-dashboard`, fetcher)
  const { data: missing } = useSWR(`${API}/api/v1/oic/missing-evidence`, fetcher)
  const { data: reqs } = useSWR(`${API}/api/v1/oic/requirements`, fetcher)

  const score = rd?.overall_readiness ?? 0
  const areas = Array.isArray(rd?.areas) ? rd.areas : []
  const missingList = Array.isArray(missing) ? missing : []
  const reqList = Array.isArray(reqs) ? reqs : []

  return (
    <div className="space-y-4">
      {/* Score hero + KPI */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-1 glass-card p-4 flex flex-col items-center justify-center">
          <p className="text-xs text-zinc-500 mb-1">OIC Readiness</p>
          <div className="text-5xl font-bold" style={{ color: pctColor(score) }}>{score}%</div>
          <p className="text-xs font-medium mt-1" style={{ color: pctColor(score) }}>
            {score >= 80 ? 'Ready' : score >= 50 ? 'In Progress' : 'Not Ready'}
          </p>
        </div>
        <KPICard label="Requirements"     value={rd?.total_requirements ?? '—'} />
        <KPICard label="Ready"            value={rd?.ready ?? '—'} subVariant="up" />
        <KPICard label="Missing Evidence" value={rd?.missing_evidence ?? '—'} subVariant="danger" />
        <KPICard label="High-Risk Gaps"   value={rd?.high_risk_gaps ?? '—'} subVariant="danger" />
      </div>

      {/* Readiness by area */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Readiness by OIC Area" />
          {areas.length === 0 ? <Empty /> : areas.map((a: any) => (
            <ProgressBar key={a.area} label={`${a.area} (${a.ready}/${a.total})`} value={a.readiness_pct} color={pctColor(a.readiness_pct)} />
          ))}
        </Card>

        <Card>
          <SectionHeader title={`⚠ Missing Evidence (${missingList.length})`} />
          {missingList.length === 0 ? <Empty message="ครบทุก requirement" /> : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {missingList.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-zinc-100 last:border-0">
                  <span className="font-mono text-[10px] text-zinc-400">{m.requirement_code}</span>
                  <span className="flex-1 text-zinc-700 truncate">{m.requirement_title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${CRIT_STYLE[m.criticality] ?? ''}`}>{m.criticality}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Requirements table */}
      <Card>
        <SectionHeader title="OIC Requirement Pack" />
        {reqList.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead><tr>
              <Th>Code</Th><Th>OIC Area</Th><Th>Requirement</Th>
              <Th>Criticality</Th><Th>Control</Th><Th>Evidence</Th>
            </tr></thead>
            <tbody>
              {reqList.map((r: any) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <Td><span className="font-mono text-[10px] text-zinc-400">{r.requirement_code}</span></Td>
                  <Td><span className="text-[11px] text-zinc-600">{r.oic_area}</span></Td>
                  <Td><span className="font-medium text-zinc-800">{r.requirement_title}</span></Td>
                  <Td><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CRIT_STYLE[r.criticality] ?? ''}`}>{r.criticality}</span></Td>
                  <Td>{r.mapped_control_id ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-400 text-xs">✗</span>}</Td>
                  <Td>{r.linked_evidence_id ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-400 text-xs">✗</span>}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  )
}
