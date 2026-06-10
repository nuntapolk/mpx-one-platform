'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const inputCls = 'w-full px-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none'

const LAWFUL = ['สัญญา (มาตรา 24(3))', 'ความยินยอม (มาตรา 24)', 'ประโยชน์โดยชอบด้วยกฎหมาย (มาตรา 24(5))', 'หน้าที่ตามกฎหมาย (มาตรา 24(6))', 'ความยินยอมโดยชัดแจ้ง (มาตรา 26)']

export default function Page() {
  const { token } = useParams<{ token: string }>()
  const [camp, setCamp] = useState<any>(null)
  const [error, setError] = useState('')
  const [identified, setIdentified] = useState(false)
  const [form, setForm] = useState<any>({
    respondent_name: '', respondent_email: '', employee_id: '', department: '',
    processing_activity_name: '', description: '', purpose: '', lawful_basis: '',
    data_subject_type: '', personal_data_category: '', recipient: '', retention_period: '',
  })
  const [err, setErr] = useState('')
  const [done, setDone] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/public/ropa-campaign/${token}`, { cache: 'no-store' })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d?.message?.message || d?.message || 'ลิงก์ไม่ถูกต้อง'); return d })
      .then(setCamp).catch((e: any) => setError(e.message))
  }, [token])

  function identify(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    if (!form.respondent_name || !form.respondent_email) { setErr('กรุณากรอกชื่อและอีเมล'); return }
    if (camp?.require_employee_id && !form.employee_id) { setErr('กรุณากรอกรหัสพนักงาน'); return }
    setIdentified(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const r = await fetch(`${API}/api/v1/public/ropa-campaign/${token}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.message?.message || d?.message || 'เกิดข้อผิดพลาด')
      setDone(d.ropa_code)
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  if (error) return <Centered><div className="text-center text-zinc-500"><div className="text-4xl mb-2">⚠️</div>{error}</div></Centered>
  if (!camp) return <Centered><div className="text-zinc-400 text-sm">กำลังโหลด...</div></Centered>

  return (
    <Centered>
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3 text-white text-2xl" style={{ background: 'linear-gradient(135deg,#15572e,#2a6b4d)' }}>📋</div>
          <h1 className="text-xl font-bold text-zinc-900">{camp.name}</h1>
          {camp.description && <p className="text-sm text-zinc-500 mt-1">{camp.description}</p>}
          {camp.deadline && <p className="text-xs text-amber-600 mt-1">⏰ กำหนดส่ง: {new Date(camp.deadline).toLocaleDateString('th-TH')}</p>}
        </div>

        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-green-700 mb-1">ส่งข้อมูลเรียบร้อย!</p>
            <p className="text-sm text-zinc-600">รหัสกิจกรรม (ROPA) ที่บันทึก</p>
            <p className="text-lg font-mono font-bold text-zinc-900 mt-1">{done}</p>
            <p className="text-xs text-zinc-400 mt-3">ขอบคุณสำหรับข้อมูล ทีม DPO จะตรวจสอบต่อไป</p>
          </div>
        ) : !identified ? (
          <form onSubmit={identify} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-800 text-sm">ขั้นที่ 1 — ระบุตัวตนผู้กรอก</h2>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">{err}</div>}
            <Field label="ชื่อ-นามสกุล" req><input required value={form.respondent_name} onChange={e => setForm((f: any) => ({ ...f, respondent_name: e.target.value }))} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="อีเมล" req><input required type="email" value={form.respondent_email} onChange={e => setForm((f: any) => ({ ...f, respondent_email: e.target.value }))} className={inputCls} /></Field>
              <Field label={`รหัสพนักงาน${camp.require_employee_id ? ' *' : ''}`}><input value={form.employee_id} onChange={e => setForm((f: any) => ({ ...f, employee_id: e.target.value }))} className={inputCls} /></Field>
            </div>
            <Field label="หน่วยงาน/แผนก"><input value={form.department} onChange={e => setForm((f: any) => ({ ...f, department: e.target.value }))} className={inputCls} /></Field>
            <button className="w-full text-white font-medium py-2.5 rounded-lg text-sm transition" style={{ background: '#15803d' }}>ถัดไป →</button>
          </form>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-800 text-sm">ขั้นที่ 2 — ข้อมูลกิจกรรมการประมวลผล</h2>
              <button type="button" onClick={() => setIdentified(false)} className="text-xs text-zinc-400 hover:text-zinc-600">← กลับ</button>
            </div>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">{err}</div>}
            <Field label="ชื่อกิจกรรมการประมวลผล" req><input required value={form.processing_activity_name} onChange={e => setForm((f: any) => ({ ...f, processing_activity_name: e.target.value }))} className={inputCls} placeholder="เช่น การจัดเก็บประวัติพนักงาน" /></Field>
            <Field label="วัตถุประสงค์"><textarea rows={2} value={form.purpose} onChange={e => setForm((f: any) => ({ ...f, purpose: e.target.value }))} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ฐานทางกฎหมาย"><select value={form.lawful_basis} onChange={e => setForm((f: any) => ({ ...f, lawful_basis: e.target.value }))} className={inputCls}><option value="">— เลือก —</option>{LAWFUL.map(l => <option key={l} value={l}>{l}</option>)}</select></Field>
              <Field label="ประเภทเจ้าของข้อมูล"><input value={form.data_subject_type} onChange={e => setForm((f: any) => ({ ...f, data_subject_type: e.target.value }))} className={inputCls} placeholder="เช่น พนักงาน, ลูกค้า" /></Field>
            </div>
            <Field label="ประเภทข้อมูลส่วนบุคคล"><input value={form.personal_data_category} onChange={e => setForm((f: any) => ({ ...f, personal_data_category: e.target.value }))} className={inputCls} placeholder="เช่น ชื่อ, ที่อยู่, เลขบัตรประชาชน" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ผู้รับข้อมูล"><input value={form.recipient} onChange={e => setForm((f: any) => ({ ...f, recipient: e.target.value }))} className={inputCls} /></Field>
              <Field label="ระยะเวลาจัดเก็บ"><input value={form.retention_period} onChange={e => setForm((f: any) => ({ ...f, retention_period: e.target.value }))} className={inputCls} placeholder="เช่น 5 ปี" /></Field>
            </div>
            <button disabled={busy} className="w-full text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50" style={{ background: '#15803d' }}>{busy ? 'กำลังส่ง...' : 'ส่งข้อมูล'}</button>
          </form>
        )}
      </div>
    </Centered>
  )
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-zinc-700 mb-1">{label} {req && <span className="text-red-500">*</span>}</label>{children}</div>
}
function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center py-10 px-4">{children}</div>
}
