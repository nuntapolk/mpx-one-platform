'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const DOMAINS = [
  { id: '', label: 'ทั้งหมด' },
  { id: 'business', label: '🏢 Business' },
  { id: 'application', label: '⚙️ Application' },
  { id: 'data', label: '◫ Data' },
  { id: 'technology', label: '🔧 Technology' },
  { id: 'security', label: '🔐 Security' },
]
const covColor = (s: string) => (({ covered: ['#dcfce7', '#15803d'], partial: ['#fef3c7', '#d97706'], gap: ['#fee2e2', '#c0272d'] } as any)[s] || ['#f1f5f9', '#64748b'])
const tierColor = (t: string) => (({ core: '#c0272d', supporting: '#d97706', commodity: '#64748b' } as any)[t] || '#64748b')

export default function Page() {
  const [domain, setDomain] = useState('')
  const listKey = `${API}/api/v1/ea-capabilities${domain ? `?domain=${domain}` : ''}`
  const sumKey = `${API}/api/v1/ea-capabilities/summary`
  const gapKey = `${API}/api/v1/ea-capabilities/gaps`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: summary } = useSWR(sumKey, fetcher)
  const { data: gaps } = useSWR(gapKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const blank = { domain: 'business', code: '', name: '', tier: 'core', category: '' }
  const [form, setForm] = useState<any>(blank)

  async function create() {
    await fetch(`${API}/api/v1/ea-capabilities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm(blank); mutate(listKey); mutate(sumKey)
  }
  async function del(id: string) {
    await fetch(`${API}/api/v1/ea-capabilities/${id}`, { method: 'DELETE' }); mutate(listKey); mutate(sumKey); mutate(gapKey)
  }

  const gapList = Array.isArray(gaps) ? gaps : []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">🏛️ EA Capabilities</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Enterprise Architecture capability catalog (TOGAF 4 domains) + application coverage / gap analysis</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {summary?.domains && Object.entries(summary.domains).map(([d, s]: any) => (
          <div key={d} className="glass-card p-3">
            <div className="text-[11px] text-zinc-500 capitalize">{d}</div>
            <div className="text-lg font-bold text-zinc-800">{s.coverage_pct}%</div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1"><div className="h-full rounded-full" style={{ width: `${s.coverage_pct}%`, background: s.coverage_pct >= 75 ? '#15803d' : s.coverage_pct >= 50 ? '#d97706' : '#c0272d' }} /></div>
            <div className="text-[9px] text-zinc-400 mt-1">{s.covered}/{s.total} covered · {s.gaps} gaps</div>
          </div>
        ))}
      </div>

      <Card>
        <SectionHeader title="Capability Catalog" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม Capability</button>
        } />
        <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60 mb-3">
          {DOMAINS.map(d => (
            <button key={d.id} onClick={() => setDomain(d.id)} className={`text-[11px] px-2.5 py-1 rounded-md font-medium ${domain === d.id ? 'glass-tab active' : 'glass-tab'}`}>{d.label}</button>
          ))}
        </div>

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 grid grid-cols-4 gap-2">
            <select value={form.domain} onChange={e => setForm((f: any) => ({ ...f, domain: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{DOMAINS.slice(1).map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select>
            <input placeholder="code" value={form.code} onChange={e => setForm((f: any) => ({ ...f, code: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input placeholder="ชื่อ capability *" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-2" />
            <select value={form.tier} onChange={e => setForm((f: any) => ({ ...f, tier: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{['core', 'supporting', 'commodity'].map(t => <option key={t} value={t}>{t}</option>)}</select>
            <input placeholder="category" value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <div className="col-span-4 flex gap-2"><button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button><button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button></div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>Code</Th><Th>Capability</Th><Th>Domain</Th><Th>Tier</Th><Th>Apps</Th><Th>Coverage</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.code}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{r.name}</span></Td>
                    <Td><span className="text-xs text-zinc-500 capitalize">{r.domain}</span></Td>
                    <Td><span className="text-[10px] font-medium capitalize" style={{ color: tierColor(r.tier) }}>{r.tier || '—'}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{r.app_count}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: covColor(r.coverage_status)[0], color: covColor(r.coverage_status)[1] }}>{r.coverage_status}</span></Td>
                    <Td><button onClick={() => del(r.id)} title="ลบ" className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">🗑️</button></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>

      {gapList.length > 0 && (
        <Card>
          <SectionHeader title={`⚠️ Capability Gaps (${gapList.length}) — ยังไม่มี application รองรับ`} />
          <div className="flex flex-wrap gap-2">
            {gapList.map((g: any) => (
              <span key={g.id} className="text-[11px] px-2 py-1 rounded-lg border" style={{ borderColor: tierColor(g.tier) + '55', color: tierColor(g.tier) }}>
                <span className="font-mono text-[9px] opacity-60">{g.code}</span> {g.name} <span className="opacity-50">· {g.domain}</span>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
