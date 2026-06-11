'use client'
import { useState } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

function critBg(v: string) { return ({ critical: '#FEF2F2', high: '#FFFBEB', medium: '#F0F9FF', low: '#F0FDF4' } as any)[v] || '#f4f4f5' }
function critFg(v: string) { return ({ critical: '#B91C1C', high: '#D97706', medium: '#0369A1', low: '#166534' } as any)[v] || '#71717a' }
const BCG = { invest: ['#dcfce7', '#15803d', 'Invest'], tolerate: ['#eff6ff', '#1d4ed8', 'Tolerate'], migrate: ['#fef3c7', '#d97706', 'Migrate'], eliminate: ['#fee2e2', '#c0272d', 'Eliminate'] } as any
const fmtTco = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n || 0)
const healthColor = (h: number) => h >= 75 ? '#15803d' : h >= 50 ? '#d97706' : '#c0272d'

export default function Page() {
  const listKey = `${API}/api/v1/applications`
  const statsKey = `${API}/api/v1/applications/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'table' | 'matrix'>('table')
  const [form, setForm] = useState({ application_name: '', application_type: '', business_criticality: '', bcg_classification: '' })
  const rows = Array.isArray(list) ? list : []

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); setShowForm(false)
    setForm({ application_name: '', application_type: '', business_criticality: '', bcg_classification: '' })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? '—'} sub={`active ${stats?.active ?? 0}`} />
        <KPICard label="Mission Critical" value={stats?.mission_critical ?? '—'} subVariant="danger" sub="critical" />
        <KPICard label="Avg Health" value={stats?.avg_health != null ? `${stats.avg_health}` : '—'} sub="0-100" />
        <KPICard label="TCO รวม/ปี" value={stats?.total_tco != null ? `฿${fmtTco(stats.total_tco)}` : '—'} />
        <KPICard label="EOL ใน 12 เดือน" value={stats?.eol_within_12m ?? '—'} subVariant="warn" sub="ต้องวางแผน" />
      </div>

      <Card>
        <SectionHeader title="Application Portfolio" action={
          <div className="flex gap-2 items-center">
            <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
              <button onClick={() => setTab('table')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === 'table' ? 'glass-tab active' : 'glass-tab'}`}>📋 รายการ</button>
              <button onClick={() => setTab('matrix')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === 'matrix' ? 'glass-tab active' : 'glass-tab'}`}>📊 BCG Matrix</button>
            </div>
            <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม</button>
          </div>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 grid grid-cols-2 gap-2">
            <input placeholder="ชื่อระบบ *" value={form.application_name} onChange={e => setForm(v => ({ ...v, application_name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ประเภท" value={form.application_type} onChange={e => setForm(v => ({ ...v, application_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <select value={form.business_criticality} onChange={e => setForm(v => ({ ...v, business_criticality: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— Criticality —</option>{['critical', 'high', 'medium', 'low'].map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={form.bcg_classification} onChange={e => setForm(v => ({ ...v, bcg_classification: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— BCG —</option>{Object.keys(BCG).map(c => <option key={c} value={c}>{BCG[c][2]}</option>)}</select>
            <div className="col-span-2 flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : tab === 'matrix' ? <BcgMatrix rows={rows} />
          : (
            <TableWrap>
              <thead><tr><Th>Code</Th><Th>ชื่อระบบ</Th><Th>BCG</Th><Th>Health</Th><Th>Tech Debt</Th><Th>Criticality</Th><Th>TCO/ปี</Th><Th>Gov</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.application_code}</span></Td>
                    <Td><Link href={`/inventory/applications/${r.id}`} className="font-medium text-zinc-800 hover:text-blue-600 hover:underline">{r.application_name}</Link></Td>
                    <Td>{r.bcg_classification ? <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: BCG[r.bcg_classification]?.[0], color: BCG[r.bcg_classification]?.[1] }}>{BCG[r.bcg_classification]?.[2]}</span> : <span className="text-zinc-300">—</span>}</Td>
                    <Td>{r.health_score != null ? <div className="flex items-center gap-1"><div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${r.health_score}%`, background: healthColor(r.health_score) }} /></div><span className="text-[10px] text-zinc-500">{r.health_score}</span></div> : '—'}</Td>
                    <Td>{r.tech_debt_score != null ? <span className="text-[10px]" style={{ color: r.tech_debt_score >= 70 ? '#c0272d' : '#71717a' }}>{r.tech_debt_score}</span> : '—'}</Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: critBg(r.business_criticality), color: critFg(r.business_criticality) }}>{r.business_criticality}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{r.tco_annual ? `฿${fmtTco(Number(r.tco_annual))}` : '—'}</span></Td>
                    <Td><div className="flex gap-0.5">{r.personal_data_flag && <span title="PDPA" className="text-[9px] px-1 rounded bg-blue-50 text-blue-700">PII</span>}{r.ai_enabled_flag && <span title="AI" className="text-[9px] px-1 rounded bg-purple-50 text-purple-700">AI</span>}{r.iso_scope_flag && <span title="ISO" className="text-[9px] px-1 rounded bg-emerald-50 text-emerald-700">ISO</span>}</div></Td>
                    <Td><Link href={`/inventory/applications/${r.id}`} className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">360°</Link></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}

/* BCG / TIME matrix — 4 quadrants */
function BcgMatrix({ rows }: { rows: any[] }) {
  const Q = ({ k, title, hint }: { k: string; title: string; hint: string }) => {
    const apps = rows.filter(r => r.bcg_classification === k)
    return (
      <div className="rounded-lg p-3 border" style={{ borderColor: BCG[k][1] + '40', background: BCG[k][0] + '55', minHeight: 150 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold" style={{ color: BCG[k][1] }}>{title}</span>
          <span className="text-[10px] text-zinc-400">{apps.length} apps</span>
        </div>
        <div className="text-[9px] text-zinc-400 mb-2">{hint}</div>
        <div className="flex flex-wrap gap-1">
          {apps.map(a => (
            <Link key={a.id} href={`/inventory/applications/${a.id}`} className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white text-zinc-700 truncate max-w-[120px]" title={a.application_name}>{a.application_name}</Link>
          ))}
          {apps.length === 0 && <span className="text-[10px] text-zinc-300">—</span>}
        </div>
      </div>
    )
  }
  return (
    <div>
      <p className="text-[11px] text-zinc-500 mb-2">BCG / TIME — แผนการลงทุนต่อแอป (คลิกแอปเพื่อดู 360°)</p>
      <div className="grid grid-cols-2 gap-3">
        <Q k="invest" title="🟢 Invest" hint="คุณค่าสูง · ลงทุนต่อ" />
        <Q k="tolerate" title="🔵 Tolerate" hint="คงไว้ · ดูแลตามปกติ" />
        <Q k="migrate" title="🟠 Migrate" hint="ย้าย/ปรับปรุง · tech debt สูง" />
        <Q k="eliminate" title="🔴 Eliminate" hint="เลิกใช้ · วางแผน decommission" />
      </div>
    </div>
  )
}
