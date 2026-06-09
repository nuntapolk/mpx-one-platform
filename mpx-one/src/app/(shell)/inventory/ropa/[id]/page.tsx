'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Card } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

type F = { key: string; label: string; kind?: 'text' | 'textarea' | 'bool' | 'number' | 'date' | 'csv' }

const PHASES: { id: string; label: string; fields: F[] }[] = [
  {
    id: 'basic', label: '1 · ข้อมูลพื้นฐาน',
    fields: [
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
    ],
  },
  {
    id: 'collection', label: '2 · การเก็บรวบรวม & โอน',
    fields: [
      { key: 'direct_collection', label: 'เก็บโดยตรงจากเจ้าของข้อมูล', kind: 'bool' },
      { key: 'collection_formats', label: 'รูปแบบการเก็บ (csv)', kind: 'csv' },
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
    ],
  },
  {
    id: 'storage', label: '3 · จัดเก็บ & เข้าถึง & ความปลอดภัย',
    fields: [
      { key: 'system_used', label: 'ระบบที่ใช้', kind: 'textarea' },
      { key: 'storage_formats', label: 'รูปแบบจัดเก็บ (csv)', kind: 'csv' },
      { key: 'internal_data_sources', label: 'แหล่งข้อมูลภายใน', kind: 'textarea' },
      { key: 'internal_shared_databases', label: 'ฐานข้อมูลที่แชร์ภายใน', kind: 'textarea' },
      { key: 'use_activities', label: 'กิจกรรมการใช้ข้อมูล (csv)', kind: 'csv' },
      { key: 'authorized_access_roles', label: 'บทบาทที่เข้าถึงได้ (csv)', kind: 'csv' },
      { key: 'access_methods', label: 'วิธีการเข้าถึง (csv)', kind: 'csv' },
      { key: 'encryption_enabled', label: 'เข้ารหัสข้อมูล', kind: 'bool' },
      { key: 'encryption_methods', label: 'วิธีเข้ารหัส (csv)', kind: 'csv' },
      { key: 'data_backup', label: 'มีการสำรองข้อมูล', kind: 'bool' },
      { key: 'backup_location', label: 'ที่เก็บ backup' },
      { key: 'bcdr_plan', label: 'มีแผน BCP/DR', kind: 'bool' },
      { key: 'access_during_maintenance', label: 'เข้าถึงได้ระหว่างบำรุงรักษา', kind: 'bool' },
      { key: 'maintenance_duration', label: 'ระยะเวลาบำรุงรักษา' },
      { key: 'technical_measures', label: 'มาตรการเชิงเทคนิค', kind: 'textarea' },
      { key: 'organizational_measures', label: 'มาตรการเชิงองค์กร', kind: 'textarea' },
      { key: 'security_measures', label: 'มาตรการความปลอดภัย (สรุป)', kind: 'textarea' },
      { key: 'retention_period', label: 'ระยะเก็บรักษา' },
      { key: 'retention_value', label: 'จำนวน', kind: 'number' },
      { key: 'retention_unit', label: 'หน่วย (days/months/years)' },
      { key: 'retention_criteria', label: 'เกณฑ์การเก็บ', kind: 'textarea' },
      { key: 'deletion_method', label: 'วิธีการทำลายข้อมูล' },
      { key: 'data_subject_rights_process', label: 'กระบวนการสิทธิเจ้าของข้อมูล', kind: 'textarea' },
      { key: 'rejection_records', label: 'บันทึกการปฏิเสธคำขอ', kind: 'textarea' },
    ],
  },
  {
    id: 'dpia', label: '4 · DPIA & Risk & Implementation',
    fields: [
      { key: 'dpia_required_flag', label: 'ต้องทำ DPIA', kind: 'bool' },
      { key: 'dpia_status', label: 'สถานะ DPIA' },
      { key: 'dpia_level', label: 'ระดับ DPIA' },
      { key: 'dpia_owner', label: 'ผู้รับผิดชอบ DPIA' },
      { key: 'dpia_drill', label: 'DPIA drill' },
      { key: 'access_control_defined', label: 'กำหนด access control แล้ว', kind: 'bool' },
      { key: 'access_control_ref', label: 'อ้างอิง access control' },
      { key: 'implementation_phase', label: 'เฟสการดำเนินการ' },
      { key: 'gap_count', label: 'จำนวน gap', kind: 'number' },
      { key: 'compliance_checks', label: 'รายการตรวจ compliance (csv)', kind: 'csv' },
      { key: 'contact_point', label: 'จุดติดต่อ' },
      { key: 'start_date', label: 'วันเริ่ม', kind: 'date' },
      { key: 'end_date', label: 'วันสิ้นสุด', kind: 'date' },
      { key: 'replacement_activity', label: 'กิจกรรมทดแทน' },
      { key: 'next_review_date', label: 'วันทบทวนถัดไป', kind: 'date' },
    ],
  },
]

export default function RopaEditor() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, mutate } = useSWR(id ? `${API}/api/v1/ropa/${id}` : null, fetcher)
  const [phase, setPhase] = useState(0)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (data && !data.statusCode) setForm(data) }, [data])

  function set(key: string, val: any) { setForm((f: any) => ({ ...f, [key]: val })); setSaved(false) }

  async function save() {
    setSaving(true)
    // strip computed fields
    const { completeness, dpia, id: _id, created_at, updated_at, ...payload } = form
    await fetch(`${API}/api/v1/ropa/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    await mutate(); setSaving(false); setSaved(true)
  }

  if (!data || data.statusCode) return <div className="p-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>

  const comp = data.completeness?.overall_pct ?? 0
  const compColor = comp >= 80 ? '#1D9E75' : comp >= 50 ? '#EF9F27' : '#E24B4A'
  const cur = PHASES[phase]

  function renderField(f: F) {
    const v = form[f.key]
    if (f.kind === 'bool') return (
      <label className="flex items-center gap-2 text-xs text-zinc-700 py-1.5">
        <input type="checkbox" checked={!!v} onChange={e => set(f.key, e.target.checked)} /> {f.label}
      </label>
    )
    if (f.kind === 'textarea') return (
      <div><label className="text-[11px] text-zinc-500 block mb-0.5">{f.label}</label>
      <textarea value={v ?? ''} onChange={e => set(f.key, e.target.value)} rows={2} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" /></div>
    )
    if (f.kind === 'csv') return (
      <div><label className="text-[11px] text-zinc-500 block mb-0.5">{f.label}</label>
      <input value={Array.isArray(v) ? v.join(', ') : (v ?? '')} onChange={e => set(f.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" /></div>
    )
    const t = f.kind === 'number' ? 'number' : f.kind === 'date' ? 'date' : 'text'
    return (
      <div><label className="text-[11px] text-zinc-500 block mb-0.5">{f.label}</label>
      <input type={t} value={f.kind === 'date' && v ? String(v).slice(0,10) : (v ?? '')} onChange={e => set(f.key, f.kind === 'number' ? +e.target.value : e.target.value)} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" /></div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
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
        {/* phase progress */}
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

      <Card>
        {/* phase tabs */}
        <div className="flex gap-1 mb-4 border-b border-zinc-100 pb-2">
          {PHASES.map((p, i) => (
            <button key={p.id} onClick={() => setPhase(i)}
              className={`text-[11px] px-3 py-1.5 rounded-lg ${phase === i ? 'glass-btn-primary' : 'text-zinc-500 hover:bg-zinc-100'}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {cur.fields.map(f => <div key={f.key}>{renderField(f)}</div>)}
        </div>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-100">
          <button onClick={save} disabled={saving} className="glass-btn-primary text-xs px-4 py-1.5 rounded-lg">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          {saved && <span className="text-xs text-emerald-600">✓ บันทึกแล้ว</span>}
          <div className="ml-auto flex gap-2">
            {phase > 0 && <button onClick={() => setPhase(phase - 1)} className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg">← ก่อนหน้า</button>}
            {phase < PHASES.length - 1 && <button onClick={() => setPhase(phase + 1)} className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg">ถัดไป →</button>}
          </div>
        </div>
      </Card>
    </div>
  )
}
