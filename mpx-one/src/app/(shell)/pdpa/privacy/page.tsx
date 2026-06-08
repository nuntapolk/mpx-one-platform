'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const STATUS: Record<string, { bg: string; c: string; label: string }> = {
  published: { bg: '#F0FDF4', c: '#166534', label: 'เผยแพร่แล้ว' },
  draft:     { bg: '#F9FAFB', c: '#6B7280', label: 'ฉบับร่าง' },
  expired:   { bg: '#FFF7ED', c: '#C2410C', label: 'หมดอายุ' },
  inactive:  { bg: '#F4F4F5', c: '#A1A1AA', label: 'ปิดใช้งาน' },
}
const TYPE_LABEL: Record<string, string> = {
  website: 'เว็บไซต์', mobile_app: 'Mobile App', recruitment: 'รับสมัครงาน',
  employee: 'พนักงาน', cctv: 'CCTV', cookie: 'Cookie', other: 'อื่นๆ',
}

export default function PrivacyPage() {
  const statsKey = `${API}/api/v1/privacy/stats`
  const noticeKey = `${API}/api/v1/privacy/notices`
  const retKey = `${API}/api/v1/privacy/retention`

  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: notices } = useSWR(noticeKey, fetcher)
  const { data: retention } = useSWR(retKey, fetcher)
  const nList = Array.isArray(notices) ? notices : []
  const rList = Array.isArray(retention) ? retention : []

  const [tab, setTab] = useState<'notices' | 'retention'>('notices')
  const [nForm, setNForm] = useState({ type: 'website', title: '', language: 'th', version: '1.0', content: '' })
  const [rForm, setRForm] = useState({ data_category: '', retention_years: 1, legal_basis: '' })
  const [showN, setShowN] = useState(false)
  const [showR, setShowR] = useState(false)

  async function createNotice() {
    await fetch(noticeKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nForm) })
    mutate(noticeKey); mutate(statsKey); setShowN(false)
    setNForm({ type: 'website', title: '', language: 'th', version: '1.0', content: '' })
  }
  async function publish(id: string) {
    await fetch(`${API}/api/v1/privacy/notices/${id}/publish`, { method: 'POST' })
    mutate(noticeKey); mutate(statsKey)
  }
  async function createRet() {
    await fetch(retKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rForm) })
    mutate(retKey); mutate(statsKey); setShowR(false)
    setRForm({ data_category: '', retention_years: 1, legal_basis: '' })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Notices ทั้งหมด" value={stats?.notices_total ?? '—'} />
        <KPICard label="เผยแพร่แล้ว" value={stats?.published ?? '—'} subVariant="up" />
        <KPICard label="ฉบับร่าง" value={stats?.draft ?? '—'} subVariant="warn" />
        <KPICard label="หมดอายุ" value={stats?.expired ?? '—'} subVariant="danger" />
        <KPICard label="Retention Rules" value={stats?.retention_schedules ?? '—'} />
      </div>

      <Card>
        <SectionHeader title="Privacy Notice & Retention" action={
          <div className="flex gap-1">
            {([['notices','Privacy Notices'],['retention','Retention Schedule']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`text-[11px] px-3 py-1 rounded-full ${tab === k ? 'glass-btn-primary' : 'text-zinc-500 hover:bg-zinc-100'}`}>{l}</button>
            ))}
          </div>
        } />

        {tab === 'notices' && (
          <>
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowN(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ Privacy Notice</button>
            </div>
            {showN && (
              <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <select value={nForm.type} onChange={e => setNForm(v => ({ ...v, type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                    {Object.entries(TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <select value={nForm.language} onChange={e => setNForm(v => ({ ...v, language: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded">
                    <option value="th">ไทย</option><option value="en">English</option>
                  </select>
                  <input placeholder="version" value={nForm.version} onChange={e => setNForm(v => ({ ...v, version: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                </div>
                <input placeholder="หัวข้อ *" value={nForm.title} onChange={e => setNForm(v => ({ ...v, title: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                <textarea placeholder="เนื้อหา" value={nForm.content} onChange={e => setNForm(v => ({ ...v, content: e.target.value }))} rows={3} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                <div className="flex gap-2">
                  <button onClick={createNotice} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก (ร่าง)</button>
                  <button onClick={() => setShowN(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
                </div>
              </div>
            )}
            {nList.length === 0 ? <Empty /> : (
              <TableWrap>
                <thead><tr><Th>ประเภท</Th><Th>หัวข้อ</Th><Th>ภาษา</Th><Th>Version</Th><Th>สถานะ</Th><Th>&nbsp;</Th></tr></thead>
                <tbody>
                  {nList.map((n: any) => {
                    const st = STATUS[n.status] ?? STATUS.draft
                    return (
                      <tr key={n.id} className="hover:bg-zinc-50">
                        <Td><span className="text-[11px] text-zinc-600">{TYPE_LABEL[n.type] ?? n.type}</span></Td>
                        <Td><span className="font-medium text-zinc-800">{n.title}</span></Td>
                        <Td><span className="text-xs uppercase text-zinc-500">{n.language}</span></Td>
                        <Td><span className="font-mono text-[11px] text-zinc-500">v{n.version}</span></Td>
                        <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.c }}>{st.label}</span></Td>
                        <Td>{n.status === 'draft' && <button onClick={() => publish(n.id)} className="glass-btn-emerald text-[10px] px-2 py-0.5 rounded">เผยแพร่</button>}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </TableWrap>
            )}
          </>
        )}

        {tab === 'retention' && (
          <>
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowR(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ Retention Rule</button>
            </div>
            {showR && (
              <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <input placeholder="ประเภทข้อมูล *" value={rForm.data_category} onChange={e => setRForm(v => ({ ...v, data_category: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="ปีที่เก็บ" value={rForm.retention_years} onChange={e => setRForm(v => ({ ...v, retention_years: +e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                  <input placeholder="ฐานกฎหมาย" value={rForm.legal_basis} onChange={e => setRForm(v => ({ ...v, legal_basis: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <button onClick={createRet} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
                  <button onClick={() => setShowR(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
                </div>
              </div>
            )}
            {rList.length === 0 ? <Empty /> : (
              <TableWrap>
                <thead><tr><Th>ประเภทข้อมูล</Th><Th>ระยะเก็บ</Th><Th>ฐานกฎหมาย</Th><Th>หมายเหตุ</Th></tr></thead>
                <tbody>
                  {rList.map((r: any) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <Td><span className="font-medium text-zinc-800">{r.data_category}</span></Td>
                      <Td><span className="text-xs font-semibold text-[#02C39A]">{r.retention_years} ปี</span></Td>
                      <Td><span className="text-[11px] text-zinc-600">{r.legal_basis}</span></Td>
                      <Td><span className="text-[11px] text-zinc-400">{r.notes ?? '—'}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
