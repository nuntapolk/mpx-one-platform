'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TABS = [
  { id: 'pdt', label: '🗂️ ประเภทข้อมูลส่วนบุคคล' },
  { id: 'dst', label: '👥 ประเภทเจ้าของข้อมูล' },
  { id: 'lawful', label: '⚖️ ฐานทางกฎหมาย' },
  { id: 'compliance', label: '🔐 Compliance Tags' },
  { id: 'fields', label: '⚙️ ROPA Field Config' },
  { id: 'sync', label: '🔄 PDPA Studio Sync' },
]

export default function Page() {
  const [tab, setTab] = useState('pdt')
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">⚙️ Master Data Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">จัดการข้อมูลตั้งต้น (master data) และ field กำหนดเองของ ROPA</p>
      </div>
      <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === t.id ? 'glass-tab active' : 'glass-tab'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'pdt' && <LookupManager category="personal_data_type" title="ประเภทข้อมูลส่วนบุคคล" />}
      {tab === 'dst' && <LookupManager category="data_subject_type" title="ประเภทเจ้าของข้อมูล" />}
      {tab === 'lawful' && <LookupManager category="lawful_basis" title="ฐานทางกฎหมาย (PDPA มาตรา 24/26)" />}
      {tab === 'compliance' && <LookupManager category="compliance_tag" title="Compliance & Governance Tags (ใช้ใน Application)" />}
      {tab === 'fields' && <FieldConfigManager />}
      {tab === 'sync' && <PdpaSyncPanel />}
    </div>
  )
}

/* ── PDPA Studio Sync (Phase 1 — one-way pull) ─────────────── */
function PdpaSyncPanel() {
  const { data: status } = useSWR(`${API}/api/v1/pdpa-sync/status`, fetcher)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const run = async () => {
    setRunning(true); setResult(null)
    try {
      const res = await fetch(`${API}/api/v1/pdpa-sync/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      setResult(await res.json())
      mutate(`${API}/api/v1/pdpa-sync/status`)
    } catch (e: any) { setResult({ success: false, error: { message: e.message } }) }
    finally { setRunning(false) }
  }
  const enabled = status?.enabled
  return (
    <Card>
      <SectionHeader title="🔄 PDPA Studio Sync (one-way pull)" />
      <div className="text-xs text-zinc-600 space-y-1.5 mb-3">
        <div>สถานะการเชื่อมต่อ: {enabled === undefined ? '…' : enabled
          ? <span className="text-green-600 font-medium">เปิดใช้งาน</span>
          : <span className="text-amber-600 font-medium">ยังไม่ตั้งค่า (ต้องตั้ง env PDPA_STUDIO_API_KEY)</span>}</div>
        <div className="text-zinc-400">Source: {status?.base_url} · ทิศทาง: {status?.direction || 'pull_only'}</div>
        <div className="text-zinc-400">Sync ล่าสุด: {status?.last_run_at ? new Date(status.last_run_at).toLocaleString('th-TH') : '—'}</div>
      </div>
      <button onClick={run} disabled={!enabled || running}
        className="text-xs px-4 py-2 rounded-lg text-white bg-[#1D63B0] hover:bg-[#17518f] disabled:opacity-40 transition-colors">
        {running ? 'กำลัง sync…' : '⤓ Sync now (ROPA · DSAR · Consent)'}
      </button>
      {!enabled && <p className="text-[11px] text-zinc-400 mt-2">ปุ่มจะเปิดเมื่อมีการตั้ง API key ของ PDPA Studio ที่ฝั่ง backend</p>}
      {(result?.results || status?.domains)?.length > 0 && (
        <div className="mt-3 border-t border-white/50 pt-3">
          <div className="text-[11px] font-medium text-zinc-600 mb-1.5">ผลล่าสุด</div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-zinc-400 text-left"><th className="py-1">Domain</th><th>Pulled</th><th>Upserted</th><th>Skipped</th><th>Error</th></tr></thead>
            <tbody>
              {(result?.results || status?.domains).map((d: any) => (
                <tr key={d.domain} className="border-t border-white/40">
                  <td className="py-1 font-medium">{d.domain}</td><td>{d.pulled}</td><td className="text-green-600">{d.upserted}</td><td>{d.skipped}</td>
                  <td className="text-red-500">{d.error || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-zinc-400 mt-2">ROPA → Shared Inventory · DSAR/Consent → PDPA modules. ข้อมูลที่สร้างใน MPX (origin=mpx) จะไม่ถูกทับ</p>
        </div>
      )}
    </Card>
  )
}

/* ── Lookup (data types) manager ───────────────────────────── */
function LookupManager({ category, title }: { category: string; title: string }) {
  const key = `${API}/api/v1/admin/lookups?category=${category}`
  const { data, isLoading } = useSWR(key, fetcher)
  const rows = (Array.isArray(data) ? data : []).slice().sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
  const [form, setForm] = useState({ value: '', label: '' })

  async function create() {
    if (!form.value || !form.label) return
    await fetch(`${API}/api/v1/admin/lookups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, category, display_order: rows.length, is_active: true }) })
    setForm({ value: '', label: '' }); mutate(key)
  }
  async function toggle(r: any) {
    await fetch(`${API}/api/v1/admin/lookups/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !r.is_active }) }); mutate(key)
  }
  async function del(id: string) { await fetch(`${API}/api/v1/admin/lookups/${id}`, { method: 'DELETE' }); mutate(key) }

  return (
    <Card>
      <SectionHeader title={title} />
      <div className="flex gap-2 mb-3">
        <input placeholder="value (key)" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded w-40" />
        <input placeholder="label (ชื่อแสดง)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded flex-1" />
        <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">+ เพิ่ม</button>
      </div>
      {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        : rows.length === 0 ? <Empty />
        : (
          <TableWrap>
            <thead><tr><Th>Value</Th><Th>Label</Th><Th>สถานะ</Th><Th>&nbsp;</Th></tr></thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <Td><span className="font-mono text-[10px] text-zinc-500">{r.value}</span></Td>
                  <Td><span className="text-zinc-800">{r.label}</span>{r.is_builtin && <span className="ml-2 text-[9px] text-zinc-400">builtin</span>}</Td>
                  <Td><button onClick={() => toggle(r)} className={`text-[10px] px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>{r.is_active ? 'active' : 'inactive'}</button></Td>
                  <Td><button onClick={() => del(r.id)} title="ลบ" className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">🗑️</button></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
    </Card>
  )
}

/* ── ROPA Field Config manager ─────────────────────────────── */
const FIELD_TYPES = ['text', 'textarea', 'select', 'checkbox', 'date', 'number']
function FieldConfigManager() {
  const key = `${API}/api/v1/ropa-field-configs`
  const { data, isLoading } = useSWR(key, fetcher)
  const rows = Array.isArray(data) ? data : []
  const [showForm, setShowForm] = useState(false)
  const blank = { field_key: '', field_label: '', field_type: 'text', section: 'general', is_required: false, options_text: '' }
  const [form, setForm] = useState<any>(blank)

  async function create() {
    if (!form.field_key || !form.field_label) return
    const body: any = { field_key: form.field_key, field_label: form.field_label, field_type: form.field_type, section: form.section, is_required: form.is_required, is_active: true, sort_order: rows.length }
    if (form.field_type === 'select' && form.options_text) {
      body.field_options = form.options_text.split(',').map((s: string) => { const v = s.trim(); return { value: v, label: v } })
    }
    await fetch(key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm(blank); setShowForm(false); mutate(key)
  }
  async function toggle(r: any) { await fetch(`${key}/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !r.is_active }) }); mutate(key) }
  async function del(id: string) { await fetch(`${key}/${id}`, { method: 'DELETE' }); mutate(key) }

  const bySection: Record<string, any[]> = {}
  for (const r of rows) { (bySection[r.section] ||= []).push(r) }

  return (
    <Card>
      <SectionHeader title="ROPA Field Config — field กำหนดเอง" action={<button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม Field</button>} />
      {showForm && (
        <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 grid grid-cols-3 gap-2">
          <input placeholder="field_key *" value={form.field_key} onChange={e => setForm((f: any) => ({ ...f, field_key: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
          <input placeholder="ชื่อแสดง (label) *" value={form.field_label} onChange={e => setForm((f: any) => ({ ...f, field_label: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-2" />
          <select value={form.field_type} onChange={e => setForm((f: any) => ({ ...f, field_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <input placeholder="section" value={form.section} onChange={e => setForm((f: any) => ({ ...f, section: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
          <label className="flex items-center gap-1 text-xs text-zinc-600"><input type="checkbox" checked={form.is_required} onChange={e => setForm((f: any) => ({ ...f, is_required: e.target.checked }))} /> required</label>
          {form.field_type === 'select' && <input placeholder="options (คั่นด้วย ,)" value={form.options_text} onChange={e => setForm((f: any) => ({ ...f, options_text: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-3" />}
          <div className="col-span-3 flex gap-2">
            <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
            <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
          </div>
        </div>
      )}
      {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        : rows.length === 0 ? <Empty />
        : Object.entries(bySection).map(([section, items]) => (
          <div key={section} className="mb-4">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase mb-1">{section}</div>
            <TableWrap>
              <thead><tr><Th>Key</Th><Th>Label</Th><Th>Type</Th><Th>Required</Th><Th>สถานะ</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {items.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-500">{r.field_key}</span></Td>
                    <Td><span className="text-zinc-800">{r.field_label}</span>{r.field_options?.length > 0 && <div className="text-[10px] text-zinc-400">{r.field_options.map((o: any) => o.label).join(', ')}</div>}</Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">{r.field_type}</span></Td>
                    <Td>{r.is_required ? <span className="text-red-500 text-xs">✓</span> : <span className="text-zinc-300">—</span>}</Td>
                    <Td><button onClick={() => toggle(r)} className={`text-[10px] px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>{r.is_active ? 'active' : 'inactive'}</button></Td>
                    <Td><button onClick={() => del(r.id)} title="ลบ" className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">🗑️</button></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        ))}
    </Card>
  )
}
