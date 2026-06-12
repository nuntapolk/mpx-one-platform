'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Card, SectionHeader } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

type F = { key: string; label: string; kind?: 'text' | 'textarea' | 'bool' | 'number' | 'date' | 'csv' }

// 5 กลุ่ม ตรงกับ top panel (completeness sections)
const GROUPS: { id: string; label: string; fields: F[] }[] = [
  { id: 'basic', label: '① ข้อมูลพื้นฐาน', fields: [
    { key: 'processing_activity_name', label: 'ชื่อกิจกรรมการประมวลผล' },
    { key: 'description', label: 'คำอธิบาย', kind: 'textarea' },
    { key: 'department', label: 'หน่วยงาน' },
    { key: 'role', label: 'บทบาท (Controller/Processor)' },
    { key: 'purpose', label: 'วัตถุประสงค์', kind: 'textarea' },
    { key: 'lawful_basis', label: 'ฐานทางกฎหมาย' },
    { key: 'legitimate_interest_description', label: 'คำอธิบายประโยชน์โดยชอบ', kind: 'textarea' },
    { key: 'data_subject_type', label: 'ประเภทเจ้าของข้อมูล' },
    { key: 'personal_data_category', label: 'หมวดข้อมูลส่วนบุคคล', kind: 'textarea' },
    { key: 'has_sensitive_data', label: 'มีข้อมูลอ่อนไหว', kind: 'bool' },
    { key: 'sensitive_data_category', label: 'หมวดข้อมูลอ่อนไหว', kind: 'textarea' },
    { key: 'risk_level', label: 'ระดับความเสี่ยง' },
  ]},
  { id: 'collection', label: '② การเก็บรวบรวม & โอน', fields: [
    { key: 'direct_collection', label: 'เก็บโดยตรงจากเจ้าของข้อมูล', kind: 'bool' },
    { key: 'collection_formats', label: 'รูปแบบการเก็บ', kind: 'csv' },
    { key: 'privacy_notice_given', label: 'แจ้ง Privacy Notice แล้ว', kind: 'bool' },
    { key: 'indirect_collection', label: 'เก็บทางอ้อม', kind: 'bool' },
    { key: 'indirect_sources', label: 'แหล่งทางอ้อม', kind: 'textarea' },
    { key: 'indirect_notice_given', label: 'แจ้งกรณีเก็บทางอ้อม', kind: 'bool' },
    { key: 're_noticing_process', label: 'กระบวนการแจ้งซ้ำ', kind: 'textarea' },
    { key: 'recipient', label: 'ผู้รับข้อมูล' },
    { key: 'third_party_transfer', label: 'มีการส่งต่อบุคคลภายนอก', kind: 'bool' },
    { key: 'cross_border_transfer_flag', label: 'ส่งข้อมูลข้ามแดน', kind: 'bool' },
    { key: 'cross_border_countries', label: 'ประเทศปลายทาง', kind: 'textarea' },
    { key: 'cross_border_safeguards', label: 'มาตรการคุ้มครองการส่งข้ามแดน' },
    { key: 'subject_volume_range', label: 'ปริมาณเจ้าของข้อมูล' },
  ]},
  { id: 'storage', label: '③ จัดเก็บ & เข้าถึง', fields: [
    { key: 'system_used', label: 'ระบบที่ใช้', kind: 'textarea' },
    { key: 'storage_formats', label: 'รูปแบบจัดเก็บ', kind: 'csv' },
    { key: 'internal_data_sources', label: 'แหล่งข้อมูลภายใน', kind: 'textarea' },
    { key: 'internal_shared_databases', label: 'ฐานข้อมูลที่แชร์ภายใน', kind: 'textarea' },
    { key: 'use_activities', label: 'กิจกรรมการใช้ข้อมูล', kind: 'csv' },
    { key: 'authorized_access_roles', label: 'บทบาทที่เข้าถึงได้', kind: 'csv' },
    { key: 'access_methods', label: 'วิธีการเข้าถึง', kind: 'csv' },
    { key: 'encryption_enabled', label: 'เข้ารหัสข้อมูล', kind: 'bool' },
    { key: 'encryption_methods', label: 'วิธีเข้ารหัส', kind: 'csv' },
    { key: 'data_backup', label: 'มีการสำรองข้อมูล', kind: 'bool' },
    { key: 'backup_location', label: 'ที่เก็บ backup' },
    { key: 'bcdr_plan', label: 'มีแผน BCP/DR', kind: 'bool' },
    { key: 'access_during_maintenance', label: 'เข้าถึงได้ระหว่างบำรุงรักษา', kind: 'bool' },
    { key: 'maintenance_duration', label: 'ระยะเวลาบำรุงรักษา' },
    { key: 'retention_period', label: 'ระยะเก็บรักษา' },
    { key: 'retention_value', label: 'จำนวน', kind: 'number' },
    { key: 'retention_unit', label: 'หน่วย (days/months/years)' },
    { key: 'retention_criteria', label: 'เกณฑ์การเก็บ', kind: 'textarea' },
    { key: 'deletion_method', label: 'วิธีการทำลายข้อมูล' },
    { key: 'data_subject_rights_process', label: 'กระบวนการสิทธิเจ้าของข้อมูล', kind: 'textarea' },
    { key: 'rejection_records', label: 'บันทึกการปฏิเสธคำขอ', kind: 'textarea' },
  ]},
  { id: 'security', label: '④ มาตรการความปลอดภัย', fields: [
    { key: 'technical_measures', label: 'มาตรการเชิงเทคนิค', kind: 'textarea' },
    { key: 'organizational_measures', label: 'มาตรการเชิงองค์กร', kind: 'textarea' },
    { key: 'security_measures', label: 'มาตรการความปลอดภัย (สรุป)', kind: 'textarea' },
  ]},
  { id: 'dpia', label: '⑤ DPIA & Risk & Implementation', fields: [
    { key: 'dpia_required_flag', label: 'ต้องทำ DPIA', kind: 'bool' },
    { key: 'dpia_status', label: 'สถานะ DPIA' },
    { key: 'dpia_level', label: 'ระดับ DPIA' },
    { key: 'dpia_owner', label: 'ผู้รับผิดชอบ DPIA' },
    { key: 'dpia_drill', label: 'DPIA drill' },
    { key: 'access_control_defined', label: 'กำหนด access control แล้ว', kind: 'bool' },
    { key: 'access_control_ref', label: 'อ้างอิง access control' },
    { key: 'implementation_phase', label: 'เฟสการดำเนินการ' },
    { key: 'gap_count', label: 'จำนวน gap', kind: 'number' },
    { key: 'compliance_checks', label: 'รายการตรวจ compliance', kind: 'csv' },
    { key: 'contact_point', label: 'จุดติดต่อ' },
    { key: 'start_date', label: 'วันเริ่ม', kind: 'date' },
    { key: 'end_date', label: 'วันสิ้นสุด', kind: 'date' },
    { key: 'replacement_activity', label: 'กิจกรรมทดแทน' },
    { key: 'next_review_date', label: 'วันทบทวนถัดไป', kind: 'date' },
  ]},
]

export default function RopaDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, mutate } = useSWR(id ? `${API}/api/v1/ropa/${id}` : null, fetcher)
  // ฐานทางกฎหมาย — ดึงตัวเลือกจาก Lookup Categories (admin ปรับเพิ่ม/ลดได้)
  const { data: lawfulOpts } = useSWR(`${API}/api/v1/admin/lookups?category=lawful_basis`, fetcher)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<any>({})
  const [saving, setSaving] = useState(false)

  if (!data || data.statusCode) return <div className="p-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>

  const comp = data.completeness?.overall_pct ?? 0
  const compColor = comp >= 80 ? '#1D9E75' : comp >= 50 ? '#EF9F27' : '#E24B4A'

  function startEdit(group: typeof GROUPS[number]) {
    const d: any = {}; for (const f of group.fields) d[f.key] = data[f.key]
    setDraft(d); setEditing(group.id)
  }
  async function save() {
    setSaving(true)
    try {
      await fetch(`${API}/api/v1/ropa/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      await mutate(); setEditing(null)
    } finally { setSaving(false) }
  }
  const set = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }))

  function readNode(f: F) {
    const v = data[f.key]
    const box = 'text-xs text-zinc-800 px-2 py-1.5 bg-zinc-50 rounded border border-zinc-100 min-h-[30px] break-words'
    if (Array.isArray(v)) {
      if (v.length === 0) return <div className={box}>—</div>
      // แสดงบรรทัดละ record
      return (
        <div className={box + ' space-y-1'}>
          {v.map((item: any, i: number) => (
            <div key={i} className="flex gap-1.5"><span className="text-zinc-300 flex-shrink-0">•</span><span>{String(item)}</span></div>
          ))}
        </div>
      )
    }
    const disp = f.kind === 'bool' ? (v ? 'ใช่' : 'ไม่') : (f.kind === 'date' && v ? String(v).slice(0, 10) : (v == null || v === '' ? '—' : String(v)))
    return <div className={box}>{disp}</div>
  }
  function editInput(f: F) {
    const v = draft[f.key]
    // ฐานทางกฎหมาย → dropdown จาก lookups (active เท่านั้น) + คงค่าปัจจุบันไว้ถ้าไม่อยู่ในรายการ
    if (f.key === 'lawful_basis') {
      const opts = (Array.isArray(lawfulOpts) ? lawfulOpts : []).filter((o: any) => o.is_active)
      const labels = opts.map((o: any) => o.label)
      return (
        <select value={v ?? ''} onChange={e => set(f.key, e.target.value)} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded">
          <option value="">— เลือกฐานทางกฎหมาย —</option>
          {v && !labels.includes(v) && <option value={v}>{v} (ค่าเดิม)</option>}
          {opts.map((o: any) => <option key={o.id} value={o.label}>{o.label}</option>)}
        </select>
      )
    }
    if (f.kind === 'bool') return <label className="flex items-center gap-2 text-xs text-zinc-700 pt-1"><input type="checkbox" checked={!!v} onChange={e => set(f.key, e.target.checked)} /> {f.label}</label>
    if (f.kind === 'textarea') return <textarea value={v ?? ''} onChange={e => set(f.key, e.target.value)} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
    if (f.kind === 'csv') return <input value={Array.isArray(v) ? v.join(', ') : (v ?? '')} onChange={e => set(f.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
    const t = f.kind === 'number' ? 'number' : f.kind === 'date' ? 'date' : 'text'
    return <input type={t} value={f.kind === 'date' && v ? String(v).slice(0, 10) : (v ?? '')} onChange={e => set(f.key, f.kind === 'number' ? +e.target.value : e.target.value)} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* header */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => router.push('/inventory/ropa')} className="glass-btn-soft text-[10px] px-2 py-0.5 rounded">← กลับ</button>
              <span className="font-mono text-[10px] text-zinc-400">{data.ropa_code}</span>
            </div>
            <h1 className="text-sm font-semibold text-zinc-900">{data.processing_activity_name}</h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: compColor }}>{comp}%</div>
            <p className="text-[10px] text-zinc-400">ความสมบูรณ์</p>
          </div>
        </div>
        {/* top panel — 5 sections */}
        {data.completeness?.sections && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {data.completeness.sections.map((s: any) => (
              <div key={s.key} className="text-center">
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.pct >= 80 ? '#1D9E75' : s.pct >= 50 ? '#EF9F27' : '#E24B4A' }} />
                </div>
                <p className="text-[9px] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5 groups — read-only + per-group edit */}
      {GROUPS.map(g => {
        const ed = editing === g.id
        return (
          <Card key={g.id}>
            <SectionHeader title={g.label} action={
              ed
                ? <div className="flex gap-1"><button onClick={save} disabled={saving} className="glass-btn-primary text-[10px] px-2 py-1 rounded">{saving ? '...' : 'บันทึก'}</button><button onClick={() => setEditing(null)} className="glass-btn-soft text-[10px] px-2 py-1 rounded">ยกเลิก</button></div>
                : <button onClick={() => startEdit(g)} title="แก้ไข" className="glass-btn-primary text-[11px] px-2 py-1 rounded">✏️</button>
            } />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {g.fields.map(f => (
                <div key={f.key}>
                  <label className="text-[11px] text-zinc-500 block mb-0.5">{f.label}</label>
                  {ed ? editInput(f) : readNode(f)}
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
