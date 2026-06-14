'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { APP_VERSION } from '@/lib/version'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

const SECTIONS: { icon: string; title: string; desc: string; items: string[] }[] = [
  {
    icon: '📊', title: 'Executive Dashboard & HOME',
    desc: 'ภาพรวมเชิงบริหารแบบ real-time รวมตัวชี้วัด ความเสี่ยง และสถานะการกำกับดูแลทั้งองค์กรไว้ในหน้าเดียว',
    items: ['KPI cards เชิงผู้บริหาร', 'สรุปความเสี่ยงและสถานะ compliance', 'มุมมอง 360° ข้ามทุกโมดูล'],
  },
  {
    icon: '🗂️', title: 'Shared Inventory',
    desc: 'ทะเบียนกลางที่ใช้ร่วมกันทุกโมดูล — Application, ROPA, Vendor, Project, AI Use Case เชื่อมโยงข้อมูลถึงกันแบบ 360°',
    items: ['Application Portfolio 360°', 'ROPA — Records of Processing', 'Vendor & Project Registry', 'AI Use Case Registry'],
  },
  {
    icon: '🛡️', title: 'IT Risk Management',
    desc: 'บริหารความเสี่ยงด้าน IT ตั้งแต่บันทึกความเสี่ยง ประเมิน likelihood/impact ไปจนถึงติดตาม issues & findings',
    items: ['IT Risk Register', 'Likelihood × Impact scoring', 'Issues & Findings tracking'],
  },
  {
    icon: '🏛️', title: 'EA Portfolio',
    desc: 'จัดการสถาปัตยกรรมองค์กร (Enterprise Architecture) ทั้ง capability map และกระบวนการ Architecture Review Board',
    items: ['EA Capabilities', 'Architecture Review Board (ARB)'],
  },
  {
    icon: '⚙️', title: 'IT & Data Governance',
    desc: 'กำกับดูแลทรัพยากร IT และข้อมูลองค์กร พร้อมทะเบียน Data Assets และการจัดชั้นความลับ (classification)',
    items: ['IT Governance', 'Data Governance', 'Data Asset Registry & lineage'],
  },
  {
    icon: '🔐', title: 'PDPA Governance',
    desc: 'ครอบคลุมการปฏิบัติตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA) แบบครบวงจร 14 โมดูลย่อย',
    items: ['Consent & Cookie Consent', 'Rights / DSAR', 'Breach Incident', 'Privacy Notice & Retention', 'DPIA', 'DPO Tasks & Training', 'External Parties & DPA', 'ROPA Campaigns, Data Map, Access Review, Workflow'],
  },
  {
    icon: '🤖', title: 'AI Governance',
    desc: 'เครื่องมือประเมินความเสี่ยง AI ตามกรอบ 21-Step Sequential AI Risk Assessment พร้อม analytics ครบวงจร',
    items: ['AI Assessment (21-step workflow)', '6-domain risk scorecard (data/model/ethical/cyber/vendor/agentic)', 'Risk tiering & approval gates', 'Analytics: heatmap, funnel, top-risk', 'Integration กับ Vendor / Risk / Training'],
  },
  {
    icon: '📜', title: 'Governance & Regulatory Mapping',
    desc: 'จับคู่ control ขององค์กรเข้ากับข้อกำหนดของกรอบและกฎหมายต่าง ๆ เพื่อพิสูจน์ความสอดคล้อง',
    items: ['Regulatory mapping', 'Control-to-clause traceability'],
  },
  {
    icon: '✅', title: 'Assessment & Report',
    desc: 'ทำแบบประเมิน เก็บหลักฐาน และเตรียมความพร้อมตรวจสอบ พร้อมรายงานเชิงวิเคราะห์',
    items: ['Assessments & templates', 'Evidence Repository', 'OIC Audit Readiness', 'Control & Framework Library', 'Reports'],
  },
  {
    icon: '🛠️', title: 'Configuration & Administration',
    desc: 'ตั้งค่าระบบ จัดการบัญชีและสิทธิ์ตามบทบาท (RBAC) พร้อม audit trail และ access logs',
    items: ['Import / Export', 'Account & Role Management (RBAC)', 'Admin Config & Lookup Categories', 'Audit Trail & Access Logs'],
  },
]

const CAPABILITIES = [
  { icon: '🔗', label: 'Cross-module 360° linkage' },
  { icon: '👥', label: 'Role-based access control (RBAC)' },
  { icon: '🔑', label: 'Keycloak SSO / JWT authentication' },
  { icon: '⚙️', label: 'Admin-configurable lookups & checklists' },
  { icon: '📈', label: 'Built-in analytics & dashboards' },
  { icon: '🇹🇭', label: 'PDPA & OIC compliance-ready' },
]

// Editable text blocks (admin-only). Defaults below; overridden by saved content.
interface AboutContent {
  heroTitle: string
  heroIntro: string
  disclaimer: string[]
  copyright: string
  copyrightNote: string
}
const DEFAULTS: AboutContent = {
  heroTitle: 'Enterprise Governance Platform',
  heroIntro: 'MPX-ONE คือแพลตฟอร์มกำกับดูแลองค์กรแบบ all-in-one ที่รวม IT Governance, Enterprise Architecture, Risk Management, PDPA และ AI Governance ไว้บนฐานข้อมูลเดียวกัน ช่วยให้องค์กรบริหารความเสี่ยง ปฏิบัติตามกฎหมาย และตรวจสอบย้อนกลับได้ครบวงจร',
  disclaimer: [
    'ข้อมูล รายงาน และผลการประเมินต่าง ๆ ที่แสดงในระบบ MPX-ONE จัดทำขึ้นเพื่อสนับสนุนการบริหารจัดการและการกำกับดูแลภายในองค์กรเท่านั้น มิได้มีวัตถุประสงค์เพื่อเป็นคำแนะนำทางกฎหมาย ภาษี การเงิน หรือการลงทุน',
    'ผลการประเมินความเสี่ยง (รวมถึงการประเมินความเสี่ยง AI และ PDPA) เป็นเพียงเครื่องมือช่วยตัดสินใจ ผู้ใช้ควรใช้วิจารณญาณและปรึกษาผู้เชี่ยวชาญหรือที่ปรึกษากฎหมายที่เกี่ยวข้องก่อนดำเนินการใด ๆ ที่มีผลผูกพันทางกฎหมาย',
    'องค์กรผู้พัฒนาไม่รับประกันความถูกต้อง ครบถ้วน หรือความเป็นปัจจุบันของข้อมูล และจะไม่รับผิดต่อความเสียหายใด ๆ ที่เกิดจากการใช้งานหรือการพึ่งพาข้อมูลในระบบนี้',
  ],
  copyright: 'MPX-ONE Enterprise Governance Platform. สงวนลิขสิทธิ์ (All rights reserved).',
  copyrightNote: 'เครื่องหมายการค้า โลโก้ และเนื้อหาทั้งหมดเป็นกรรมสิทธิ์ของเจ้าของลิขสิทธิ์ ห้ามทำซ้ำหรือเผยแพร่โดยไม่ได้รับอนุญาต',
}

export default function AboutPage() {
  const year = new Date().getFullYear()
  const [content, setContent] = useState<AboutContent>(DEFAULTS)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AboutContent>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    // session → admin?
    fetch('/api/auth/me', { cache: 'no-store' }).then(r => r.json()).then(s => {
      const roles: string[] = s?.user?.roles ?? []
      setIsAdmin(!s?.auth_enabled || roles.includes('admin'))
    }).catch(() => {})
    // saved content (merge over defaults)
    fetch(`${API}/api/v1/app-content/about`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.value) setContent({ ...DEFAULTS, ...d.value })
    }).catch(() => {})
  }, [])

  const startEdit = () => { setDraft(content); setMsg(''); setEditing(true) }
  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API}/api/v1/app-content/about`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: draft }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => null)
        throw new Error(e?.message?.message || e?.message || 'บันทึกไม่สำเร็จ')
      }
      setContent(draft); setEditing(false); setMsg('บันทึกแล้ว')
    } catch (e: any) { setMsg(e.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const taCls = 'w-full text-xs border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1D63B0] leading-relaxed'

  return (
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(180deg, #f3f8fd 0%, #e8f0fa 100%)' }}>
      <header className="h-14 flex items-center justify-between px-6" style={{ borderBottom: '1px solid rgba(13,27,62,0.08)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mpx-one-logo.png" alt="MPX-ONE" className="h-8 w-auto object-contain" />
        <div className="flex items-center gap-2">
          {isAdmin && !editing && (
            <button onClick={startEdit} title="แก้ไขข้อมูล (เฉพาะ Admin)"
              className="text-xs px-3 py-1.5 rounded-lg text-[#1D63B0] hover:bg-white/80 transition-colors border border-[#1D63B0]/40 flex items-center gap-1.5">
              ✏️ แก้ไขข้อมูล
            </button>
          )}
          {editing && (
            <>
              <button onClick={save} disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg text-white bg-[#1D63B0] hover:bg-[#17518f] transition-colors disabled:opacity-50">
                {saving ? 'กำลังบันทึก…' : '💾 บันทึก'}
              </button>
              <button onClick={() => { setEditing(false); setMsg('') }}
                className="text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-white/80 border border-zinc-200">ยกเลิก</button>
            </>
          )}
          <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-lg text-zinc-600 hover:text-[#1D63B0] hover:bg-white/70 transition-colors border border-zinc-200">
            ← กลับสู่แอป
          </Link>
        </div>
      </header>

      {msg && <div className="max-w-5xl mx-auto px-6 pt-3"><div className="text-xs px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">{msg}</div></div>}

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mpx-one-logo.png" alt="MPX-ONE" className="h-16 w-auto object-contain mx-auto mb-5" />
          {editing ? (
            <div className="max-w-2xl mx-auto space-y-2 text-left">
              <input value={draft.heroTitle} onChange={e => setDraft({ ...draft, heroTitle: e.target.value })}
                className="w-full text-center text-lg font-bold border border-zinc-300 rounded-lg px-3 py-2 text-[#0D1B3E]" />
              <textarea value={draft.heroIntro} onChange={e => setDraft({ ...draft, heroIntro: e.target.value })} rows={4} className={taCls} />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#0D1B3E] mb-3" style={{ fontFamily: 'var(--font-brand)' }}>{content.heroTitle}</h1>
              <p className="text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed">{content.heroIntro}</p>
            </>
          )}
        </section>

        {/* Capabilities */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {CAPABILITIES.map(c => (
            <div key={c.label} className="flex items-center gap-2.5 bg-white/70 rounded-xl px-4 py-3 border border-zinc-100">
              <span className="text-lg">{c.icon}</span>
              <span className="text-xs text-zinc-700 font-medium">{c.label}</span>
            </div>
          ))}
        </section>

        {/* Features */}
        <h2 className="text-lg font-bold text-[#0D1B3E] mb-5 flex items-center gap-2">
          <span>🧩</span> คุณลักษณะและความสามารถ (Features)
        </h2>
        <section className="grid md:grid-cols-2 gap-4 mb-14">
          {SECTIONS.map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">{s.icon}</span>
                <h3 className="text-sm font-semibold text-[#0D1B3E]">{s.title}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">{s.desc}</p>
              <ul className="space-y-1">
                {s.items.map(it => (
                  <li key={it} className="flex gap-1.5 text-[11px] text-zinc-600">
                    <span className="text-[#1D63B0] flex-shrink-0">▸</span><span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Disclaimer */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span>⚠️</span> ข้อจำกัดความรับผิด (Disclaimer)
          </h2>
          {editing ? (
            <div className="space-y-2">
              {draft.disclaimer.map((p, i) => (
                <textarea key={i} value={p} rows={3} className={taCls}
                  onChange={e => { const d = [...draft.disclaimer]; d[i] = e.target.value; setDraft({ ...draft, disclaimer: d }) }} />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 text-[11px] text-amber-900/80 leading-relaxed">
              {content.disclaimer.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
        </section>

        {/* Footer / copyright */}
        <footer className="text-center py-8 border-t border-zinc-200 mt-6">
          {editing ? (
            <div className="max-w-2xl mx-auto space-y-2">
              <input value={draft.copyright} onChange={e => setDraft({ ...draft, copyright: e.target.value })} className={taCls + ' text-center'} />
              <textarea value={draft.copyrightNote} onChange={e => setDraft({ ...draft, copyrightNote: e.target.value })} rows={2} className={taCls} />
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-500 mb-1">© {year} {content.copyright}</p>
              <p className="text-[10px] text-zinc-400">{content.copyrightNote}</p>
            </>
          )}
          <p className="text-[10px] text-zinc-400 mt-2 font-mono">Version {APP_VERSION.version} · Build B{APP_VERSION.build}</p>
        </footer>
      </main>
    </div>
  )
}
