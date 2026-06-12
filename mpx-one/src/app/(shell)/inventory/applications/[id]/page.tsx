'use client'
import { useState } from 'react'
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
const inputCls = 'text-xs px-2 py-1 border border-zinc-200 rounded w-full'
// known compliance tags → boolean flags (keep stats/alerts in sync)
const COMP_FLAG: Record<string, string> = { pdpa: 'personal_data_flag', sensitive: 'sensitive_data_flag', iso: 'iso_scope_flag', oic: 'oic_scope_flag', ai: 'ai_enabled_flag', internet: 'internet_facing_flag' }

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const key = `${API}/api/v1/applications/${id}/360`
  const { data, isLoading, mutate } = useSWR(key, fetcher)
  // compliance tags — ตัวเลือกจาก Lookup Categories (admin เพิ่ม/ลดได้)
  const { data: compOpts } = useSWR(`${API}/api/v1/admin/lookups?category=compliance_tag`, fetcher)
  // which section is in edit mode
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<any>({})
  const [saving, setSaving] = useState(false)

  if (isLoading) return <div className="py-10 text-center text-xs text-zinc-400">กำลังโหลด...</div>
  if (!data?.application) return <Card><Empty message="ไม่พบ Application" /></Card>

  const a = data.application
  const apm = data.apm || {}
  const c = data.compliance || {}
  const pdpa = data.pdpa || {}

  function startEdit(section: string, fields: string[]) {
    const d: any = {}; for (const f of fields) d[f] = a[f]
    setDraft(d); setEditing(section)
  }
  async function save() {
    setSaving(true)
    try {
      await fetch(`${API}/api/v1/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      await mutate()
      setEditing(null)
    } finally { setSaving(false) }
  }
  const set = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }))

  const EditBtn = ({ section, fields }: { section: string; fields: string[] }) =>
    editing === section
      ? <div className="flex gap-1"><button onClick={save} disabled={saving} title="บันทึก" className="glass-btn-primary text-[10px] px-2 py-1 rounded">{saving ? '...' : 'บันทึก'}</button><button onClick={() => setEditing(null)} title="ยกเลิก" className="glass-btn-soft text-[10px] px-2 py-1 rounded">ยกเลิก</button></div>
      : <button onClick={() => startEdit(section, fields)} title="แก้ไข" className="glass-btn-primary text-[11px] px-2 py-1 rounded">✏️</button>

  const Gauge = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="text-center">
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${color} ${(value || 0) * 3.6}deg, #f1f5f9 0deg)` }}>
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sm font-bold" style={{ color }}>{value ?? '—'}</div>
      </div>
      <div className="text-[10px] text-zinc-500 mt-1">{label}</div>
    </div>
  )

  const ed = (s: string) => editing === s

  return (
    <div className="space-y-4">
      {/* Header / Identity */}
      <div className="flex items-center gap-2">
        <Link href="/inventory/applications" className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg">← Portfolio</Link>
        <div className="flex-1">
          {ed('identity') ? (
            <div className="grid grid-cols-4 gap-2 max-w-2xl">
              <input className={inputCls + ' col-span-2'} value={draft.application_name ?? ''} onChange={e => set('application_name', e.target.value)} placeholder="ชื่อระบบ" />
              <input className={inputCls} value={draft.application_type ?? ''} onChange={e => set('application_type', e.target.value)} placeholder="ประเภท" />
              <select className={inputCls} value={draft.lifecycle_status ?? ''} onChange={e => set('lifecycle_status', e.target.value)}>{['planned', 'under_development', 'active', 'under_change', 'retiring', 'retired'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
              <select className={inputCls} value={draft.business_criticality ?? ''} onChange={e => set('business_criticality', e.target.value)}>{['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}</select>
              <select className={inputCls} value={draft.bcg_classification ?? ''} onChange={e => set('bcg_classification', e.target.value)}><option value="">— BCG —</option>{Object.keys(BCG).map(k => <option key={k} value={k}>{BCG[k][2]}</option>)}</select>
              <input className={inputCls + ' col-span-2'} value={draft.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="คำอธิบาย" />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-zinc-800">{a.application_name}</h1>
              <p className="text-[11px] text-zinc-400 font-mono">{a.application_code} · {a.application_type || '—'} · {(a.lifecycle_status || '').replace(/_/g, ' ')}</p>
            </>
          )}
        </div>
        {!ed('identity') && a.bcg_classification && <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: BCG[a.bcg_classification]?.[0], color: BCG[a.bcg_classification]?.[1] }}>{BCG[a.bcg_classification]?.[2]}</span>}
        <EditBtn section="identity" fields={['application_name', 'application_type', 'description', 'lifecycle_status', 'business_criticality', 'bcg_classification']} />
      </div>

      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <div className="text-xs font-medium text-amber-800 mb-1">⚠️ ข้อควรระวัง</div>
          <div className="flex flex-wrap gap-2">{data.alerts.map((al: string, i: number) => <span key={i} className="text-[11px] text-amber-700">• {al}</span>)}</div>
        </div>
      )}

      {/* APM */}
      <Card>
        <SectionHeader title="📊 Portfolio (APM)" action={<EditBtn section="apm" fields={['bcg_classification', 'health_score', 'tech_debt_score', 'tco_annual', 'strategic_value', 'users_count', 'business_criticality', 'ea_group']} />} />
        {ed('apm') ? (
          <div className="grid grid-cols-4 gap-2">
            <L label="BCG"><select className={inputCls} value={draft.bcg_classification ?? ''} onChange={e => set('bcg_classification', e.target.value)}><option value="">—</option>{Object.keys(BCG).map(k => <option key={k} value={k}>{BCG[k][2]}</option>)}</select></L>
            <L label="Health (0-100)"><input type="number" className={inputCls} value={draft.health_score ?? ''} onChange={e => set('health_score', e.target.value === '' ? null : +e.target.value)} /></L>
            <L label="Tech Debt (0-100)"><input type="number" className={inputCls} value={draft.tech_debt_score ?? ''} onChange={e => set('tech_debt_score', e.target.value === '' ? null : +e.target.value)} /></L>
            <L label="Strategic (0-100)"><input type="number" className={inputCls} value={draft.strategic_value ?? ''} onChange={e => set('strategic_value', e.target.value === '' ? null : +e.target.value)} /></L>
            <L label="TCO/ปี (บาท)"><input type="number" className={inputCls} value={draft.tco_annual ?? ''} onChange={e => set('tco_annual', e.target.value === '' ? null : +e.target.value)} /></L>
            <L label="Users"><input type="number" className={inputCls} value={draft.users_count ?? ''} onChange={e => set('users_count', e.target.value === '' ? null : +e.target.value)} /></L>
            <L label="Criticality"><select className={inputCls} value={draft.business_criticality ?? ''} onChange={e => set('business_criticality', e.target.value)}>{['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}</select></L>
            <L label="EA Group"><input className={inputCls} value={draft.ea_group ?? ''} onChange={e => set('ea_group', e.target.value)} /></L>
          </div>
        ) : (
          <div className="flex items-center gap-8 flex-wrap">
            <Gauge label="Health" value={apm.health} color={healthColor(apm.health ?? 0)} />
            <Gauge label="Tech Debt" value={apm.tech_debt} color={apm.tech_debt >= 70 ? '#c0272d' : '#d97706'} />
            <Gauge label="Strategic" value={apm.strategic} color="#1d4ed8" />
            <div className="space-y-1 text-sm">
              <KvLine k="TCO/ปี" v={`฿${fmtTco(Number(apm.tco) || 0)}`} />
              <KvLine k="Criticality" v={apm.criticality} />
              <KvLine k="Users" v={a.users_count ?? '—'} />
              <KvLine k="EA Group" v={a.ea_group ?? '—'} />
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Compliance — configurable checkboxes (Lookup Categories) */}
        <Card>
          <SectionHeader title="🔐 Compliance & Governance" action={<EditBtn section="compliance" fields={['compliance_tags', 'personal_data_flag', 'sensitive_data_flag', 'iso_scope_flag', 'oic_scope_flag', 'ai_enabled_flag', 'internet_facing_flag']} />} />
          {(() => {
            const opts = (Array.isArray(compOpts) ? compOpts : []).filter((o: any) => o.is_active)
            const labelOf = (v: string) => opts.find((o: any) => o.value === v)?.label || v
            if (ed('compliance')) {
              const tags: string[] = Array.isArray(draft.compliance_tags) ? draft.compliance_tags : []
              const toggle = (val: string) => {
                const next = tags.includes(val) ? tags.filter(t => t !== val) : [...tags, val]
                const patch: any = { compliance_tags: next }
                if (COMP_FLAG[val]) patch[COMP_FLAG[val]] = next.includes(val)  // sync known flag
                setDraft((d: any) => ({ ...d, ...patch }))
              }
              return (
                <div className="space-y-1.5">
                  {opts.map((o: any) => (
                    <label key={o.id} className="flex items-center gap-2 text-xs text-zinc-600"><input type="checkbox" checked={tags.includes(o.value)} onChange={() => toggle(o.value)} /> {o.label}</label>
                  ))}
                  {opts.length === 0 && <p className="text-[11px] text-zinc-400">ยังไม่มีรายการ — เพิ่มได้ที่ Master Data → Compliance</p>}
                </div>
              )
            }
            const tags: string[] = Array.isArray(a.compliance_tags) ? a.compliance_tags : []
            return tags.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => <Flag key={t} on={true} label={labelOf(t)} color="#1d4ed8" />)}
              </div>
            ) : <p className="text-xs text-zinc-400">— ยังไม่ระบุ —</p>
          })()}
        </Card>

        {/* Operations */}
        <Card>
          <SectionHeader title="🔧 Operations & Tech" action={<EditBtn section="ops" fields={['hosting_type', 'environment', 'os_platform', 'db_platform', 'support_model', 'service_hours', 'dr_enabled', 'eol_date']} />} />
          {ed('ops') ? (
            <div className="grid grid-cols-2 gap-2">
              <L label="Hosting"><input className={inputCls} value={draft.hosting_type ?? ''} onChange={e => set('hosting_type', e.target.value)} /></L>
              <L label="Environment"><input className={inputCls} value={draft.environment ?? ''} onChange={e => set('environment', e.target.value)} /></L>
              <L label="OS"><input className={inputCls} value={draft.os_platform ?? ''} onChange={e => set('os_platform', e.target.value)} /></L>
              <L label="Database"><input className={inputCls} value={draft.db_platform ?? ''} onChange={e => set('db_platform', e.target.value)} /></L>
              <L label="Support"><input className={inputCls} value={draft.support_model ?? ''} onChange={e => set('support_model', e.target.value)} /></L>
              <L label="Service"><input className={inputCls} value={draft.service_hours ?? ''} onChange={e => set('service_hours', e.target.value)} /></L>
              <L label="EOL"><input type="date" className={inputCls} value={(draft.eol_date ?? '').slice(0, 10)} onChange={e => set('eol_date', e.target.value || null)} /></L>
              <L label="DR"><label className="flex items-center gap-2 text-xs text-zinc-600 pt-1"><input type="checkbox" checked={!!draft.dr_enabled} onChange={e => set('dr_enabled', e.target.checked)} /> มี DR</label></L>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <Kv k="Hosting" v={a.hosting_type} /><Kv k="Environment" v={a.environment} />
              <Kv k="OS" v={a.os_platform} /><Kv k="Database" v={a.db_platform} />
              <Kv k="Support" v={a.support_model} /><Kv k="Service" v={a.service_hours} />
              <Kv k="DR" v={a.dr_enabled ? 'มี' : 'ไม่มี'} /><Kv k="EOL" v={a.eol_date} />
            </div>
          )}
        </Card>
      </div>

      {/* PDPA / ROPA (read-only, derived) */}
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

      {data.vendor && (
        <Card>
          <SectionHeader title="🏢 Vendor" />
          <div className="text-sm"><span className="font-medium text-zinc-800">{data.vendor.name}</span> <span className="text-[10px] font-mono text-zinc-400 ml-2">{data.vendor.code}</span></div>
        </Card>
      )}
    </div>
  )
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-[10px] text-zinc-400 mb-0.5">{label}</div>{children}</div>
}
function KvLine({ k, v }: { k: string; v: any }) {
  return <div className="flex gap-2"><span className="text-zinc-500 w-24">{k}:</span><span className="font-semibold capitalize">{v ?? '—'}</span></div>
}
function Kv({ k, v }: { k: string; v: any }) {
  return <><span className="text-zinc-400">{k}</span><span className="text-zinc-700">{v || '—'}</span></>
}
function Flag({ on, label, color }: { on: boolean; label: string; color: string }) {
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: on ? color + '22' : '#f4f4f5', color: on ? color : '#a1a1aa' }}>{on ? '✓ ' : '— '}{label}</span>
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
