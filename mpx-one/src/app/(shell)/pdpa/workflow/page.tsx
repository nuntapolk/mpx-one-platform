'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const MODULES = ['ropa', 'dpia', 'breach', 'rights', 'risk']
const modColor = (m: string) => (({ ropa: '#15803d', dpia: '#7c3aed', breach: '#c0272d', rights: '#1d4ed8', risk: '#d97706' } as any)[m] || '#64748b')
const stColor = (s: string) => (({ active: ['#eff6ff', '#1d4ed8'], completed: ['#dcfce7', '#15803d'], rejected: ['#fee2e2', '#c0272d'], cancelled: ['#f1f5f9', '#64748b'] } as any)[s] || ['#f1f5f9', '#64748b'])

export default function Page() {
  const tplKey = `${API}/api/v1/workflows`
  const instKey = `${API}/api/v1/workflows/instances`
  const statsKey = `${API}/api/v1/workflows/stats`
  const { data: tpls } = useSWR(tplKey, fetcher)
  const { data: insts } = useSWR(instKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const templates = Array.isArray(tpls) ? tpls : []
  const instances = Array.isArray(insts) ? insts : []
  const [tab, setTab] = useState<'templates' | 'instances'>('templates')

  const [showForm, setShowForm] = useState(false)
  const blank = { name: '', module: 'ropa', description: '', steps: [{ name: '', role: '', sla_days: 3 }] }
  const [form, setForm] = useState<any>(blank)

  function refresh() { mutate(tplKey); mutate(instKey); mutate(statsKey) }

  async function createTpl() {
    await fetch(tplKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm(blank); refresh()
  }
  async function delTpl(id: string) { await fetch(`${tplKey}/${id}`, { method: 'DELETE' }); refresh() }
  async function startInst(template_id: string, subject: string) {
    await fetch(instKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template_id, subject }) })
    setTab('instances'); refresh()
  }
  async function advance(id: string, action: string) {
    await fetch(`${instKey}/${id}/advance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, actor: 'me' }) })
    refresh()
  }
  async function cancelInst(id: string) { await fetch(`${instKey}/${id}/cancel`, { method: 'POST' }); refresh() }

  const tplById = new Map(templates.map((t: any) => [t.id, t]))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Templates" value={stats?.templates ?? '—'} />
        <KPICard label="กำลังดำเนินการ" value={stats?.active ?? '—'} sub="active" />
        <KPICard label="เสร็จสิ้น" value={stats?.completed ?? '—'} sub="completed" />
        <KPICard label="ปฏิเสธ" value={stats?.rejected ?? '—'} subVariant="danger" sub="rejected" />
      </div>

      <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
        {(['templates', 'instances'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === t ? 'glass-tab active' : 'glass-tab'}`}>
            {t === 'templates' ? '📋 Templates' : '▶️ Running Instances'}
          </button>
        ))}
      </div>

      {tab === 'templates' ? (
        <Card>
          <SectionHeader title="Workflow Templates" action={<button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ สร้าง Template</button>} />
          {showForm && (
            <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input placeholder="ชื่อ Workflow *" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded col-span-2" />
                <select value={form.module} onChange={e => setForm((f: any) => ({ ...f, module: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">{MODULES.map(m => <option key={m} value={m}>{m}</option>)}</select>
              </div>
              <input placeholder="คำอธิบาย" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded w-full" />
              <div className="text-[11px] font-medium text-zinc-500 pt-1">ขั้นตอน:</div>
              {form.steps.map((s: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] text-zinc-400 w-4">{i + 1}.</span>
                  <input placeholder="ชื่อขั้นตอน" value={s.name} onChange={e => setForm((f: any) => { const st = [...f.steps]; st[i] = { ...st[i], name: e.target.value }; return { ...f, steps: st } })} className="text-xs px-2 py-1.5 border border-zinc-200 rounded flex-1" />
                  <input placeholder="role" value={s.role} onChange={e => setForm((f: any) => { const st = [...f.steps]; st[i] = { ...st[i], role: e.target.value }; return { ...f, steps: st } })} className="text-xs px-2 py-1.5 border border-zinc-200 rounded w-28" />
                  <input type="number" placeholder="SLA" value={s.sla_days} onChange={e => setForm((f: any) => { const st = [...f.steps]; st[i] = { ...st[i], sla_days: +e.target.value }; return { ...f, steps: st } })} className="text-xs px-2 py-1.5 border border-zinc-200 rounded w-16" />
                  {form.steps.length > 1 && <button onClick={() => setForm((f: any) => ({ ...f, steps: f.steps.filter((_: any, j: number) => j !== i) }))} className="glass-btn-danger text-[10px] px-1.5 py-0.5 rounded">×</button>}
                </div>
              ))}
              <button onClick={() => setForm((f: any) => ({ ...f, steps: [...f.steps, { name: '', role: '', sla_days: 3 }] }))} className="glass-btn-soft text-[10px] px-2 py-1 rounded">+ เพิ่มขั้นตอน</button>
              <div className="flex gap-2 pt-1">
                <button onClick={createTpl} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
                <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
              </div>
            </div>
          )}
          {templates.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {templates.map((t: any) => (
                <div key={t.id} className="border border-zinc-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase" style={{ background: modColor(t.module) + '22', color: modColor(t.module) }}>{t.module}</span>
                    <span className="font-medium text-zinc-800 text-sm">{t.name}</span>
                    {!t.is_active && <span className="text-[10px] text-zinc-400">(ปิดใช้งาน)</span>}
                    <span className="text-[10px] text-zinc-400 ml-auto">{t.instances_count} instances</span>
                  </div>
                  {t.description && <p className="text-xs text-zinc-500 mt-1">{t.description}</p>}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {t.steps.map((s: any, i: number) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">{s.step}. {s.name} <span className="text-zinc-400">({s.role}, {s.sla_days}d)</span></span>
                        {i < t.steps.length - 1 && <span className="text-zinc-300 text-[10px]">→</span>}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startInst(t.id, `${t.module.toUpperCase()}: ${t.name}`)} className="glass-btn-primary text-[10px] px-2 py-1 rounded">▶️ เริ่ม Instance</button>
                    <button onClick={() => delTpl(t.id)} className="glass-btn-danger text-[10px] px-2 py-1 rounded">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <SectionHeader title="Running Instances" />
          {instances.length === 0 ? <Empty message="ยังไม่มี instance — เริ่มจาก Template" /> : (
            <div className="space-y-3">
              {instances.map((inst: any) => {
                const tpl: any = tplById.get(inst.template_id)
                const steps: any[] = tpl?.steps || []
                return (
                  <div key={inst.id} className="border border-zinc-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-zinc-800 text-sm">{inst.subject}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: stColor(inst.status)[0], color: stColor(inst.status)[1] }}>{inst.status}</span>
                      <span className="text-[10px] text-zinc-400 ml-auto">{tpl?.name}</span>
                    </div>
                    {/* Step tracker */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {steps.map((s: any, i: number) => {
                        const done = inst.current_step > s.step || inst.status === 'completed'
                        const active = inst.current_step === s.step && inst.status === 'active'
                        const bg = done ? '#15803d' : active ? '#1d4ed8' : '#e4e4e7'
                        const fg = done || active ? '#fff' : '#71717a'
                        return (
                          <span key={i} className="flex items-center gap-1">
                            <span className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ background: bg, color: fg }}>
                              {done ? '✓' : s.step}. {s.name}
                            </span>
                            {i < steps.length - 1 && <span className="text-zinc-300 text-[10px]">→</span>}
                          </span>
                        )
                      })}
                    </div>
                    {inst.status === 'active' && (
                      <div className="flex gap-2">
                        <button onClick={() => advance(inst.id, 'approve')} className="glass-btn-primary text-[10px] px-2 py-1 rounded">✓ อนุมัติขั้นนี้</button>
                        <button onClick={() => advance(inst.id, 'reject')} className="glass-btn-danger text-[10px] px-2 py-1 rounded">✗ ปฏิเสธ</button>
                        <button onClick={() => cancelInst(inst.id)} className="glass-btn-soft text-[10px] px-2 py-1 rounded">ยกเลิก</button>
                      </div>
                    )}
                    {Array.isArray(inst.step_history) && inst.step_history.length > 1 && (
                      <details className="mt-2">
                        <summary className="text-[10px] text-zinc-400 cursor-pointer">ประวัติ ({inst.step_history.length})</summary>
                        <div className="mt-1 space-y-0.5">
                          {inst.step_history.map((h: any, i: number) => (
                            <div key={i} className="text-[10px] text-zinc-500">• ขั้น {h.step}: {h.action} โดย {h.actor} {h.notes && `— ${h.notes}`} <span className="text-zinc-300">{new Date(h.at).toLocaleString('th-TH')}</span></div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
