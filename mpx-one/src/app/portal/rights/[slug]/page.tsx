'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const TYPES = [
  { v: 'access', l: 'ขอเข้าถึงข้อมูล (Access)' },
  { v: 'rectification', l: 'ขอแก้ไขข้อมูล (Rectification)' },
  { v: 'erasure', l: 'ขอลบข้อมูล (Erasure)' },
  { v: 'restriction', l: 'ขอระงับการใช้ข้อมูล (Restriction)' },
  { v: 'portability', l: 'ขอโอนย้ายข้อมูล (Portability)' },
  { v: 'objection', l: 'ขอคัดค้านการประมวลผล (Objection)' },
  { v: 'withdraw_consent', l: 'ขอถอนความยินยอม (Withdraw consent)' },
]

const inputCls = 'w-full px-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'

export default function Page() {
  const { slug } = useParams<{ slug: string }>()
  const [org, setOrg] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<any>({ requester_name: '', requester_email: '', requester_phone: '', request_type: '', description: '', _hp_name: '' })
  const [err, setErr] = useState('')
  const [ticket, setTicket] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/public/rights/${slug}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject()).then(setOrg).catch(() => setNotFound(true))
  }, [slug])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const r = await fetch(`${API}/api/v1/public/rights/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.message?.message || d?.message || 'เกิดข้อผิดพลาด')
      setTicket(d.ticket_number)
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  if (notFound) return <Centered><div className="text-center text-zinc-500"><div className="text-4xl mb-2">🔍</div>ไม่พบองค์กรนี้</div></Centered>
  if (!org) return <Centered><div className="text-zinc-400 text-sm">กำลังโหลด...</div></Centered>

  return (
    <Centered>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-3 text-white text-2xl">⚖️</div>
          <h1 className="text-xl font-bold text-zinc-900">ยื่นคำขอสิทธิ์เจ้าของข้อมูล</h1>
          <p className="text-sm text-zinc-500 mt-1">{org.name}</p>
        </div>

        {ticket ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-green-700 mb-1">ส่งคำขอสำเร็จ!</p>
            <p className="text-sm text-zinc-600">หมายเลขอ้างอิงของคุณคือ</p>
            <p className="text-lg font-mono font-bold text-zinc-900 mt-1">{ticket}</p>
            <p className="text-xs text-zinc-400 mt-3">เราจะดำเนินการภายใน 30 วันตามที่ PDPA กำหนด</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">{err}</div>}
            {/* honeypot */}
            <input type="text" tabIndex={-1} autoComplete="off" value={form._hp_name} onChange={e => setForm((f: any) => ({ ...f, _hp_name: e.target.value }))} style={{ position: 'absolute', left: '-9999px' }} aria-hidden />
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input required value={form.requester_name} onChange={e => setForm((f: any) => ({ ...f, requester_name: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                <input required type="email" value={form.requester_email} onChange={e => setForm((f: any) => ({ ...f, requester_email: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">โทรศัพท์</label>
                <input value={form.requester_phone} onChange={e => setForm((f: any) => ({ ...f, requester_phone: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ประเภทคำขอ <span className="text-red-500">*</span></label>
              <select required value={form.request_type} onChange={e => setForm((f: any) => ({ ...f, request_type: e.target.value }))} className={inputCls}>
                <option value="">— เลือกประเภท —</option>
                {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">รายละเอียดคำขอ <span className="text-red-500">*</span></label>
              <textarea required rows={4} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="โปรดอธิบายคำขอของคุณ..." />
            </div>
            <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition">
              {busy ? 'กำลังส่ง...' : 'ส่งคำขอ'}
            </button>
            <p className="text-[11px] text-zinc-400 text-center">ข้อมูลของคุณจะถูกใช้เพื่อดำเนินการตามคำขอเท่านั้น</p>
          </form>
        )}
      </div>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center py-10 px-4">{children}</div>
}
