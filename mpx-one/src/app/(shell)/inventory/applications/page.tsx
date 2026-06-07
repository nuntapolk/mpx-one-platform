'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url).then(r => r.json())

function critBg(v: string) { return { critical:'#FEF2F2', high:'#FFFBEB', medium:'#F0F9FF', low:'#F0FDF4' }[v] || '#f4f4f5' }
function critFg(v: string) { return { critical:'#B91C1C', high:'#D97706', medium:'#0369A1', low:'#166534' }[v] || '#71717a' }

export default function Page() {
  const listKey = `${API}/api/v1/applications`
  const statsKey = `${API}/api/v1/applications/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ application_name: "", application_type: "", business_criticality: "" })

  const rows = Array.isArray(list) ? list : []

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey)
    setShowForm(false)
    setForm({ application_name: "", application_type: "", business_criticality: "" })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? "—"} />
        <KPICard label="ไม่มี Owner" value={stats?.no_owner ?? "—"} subVariant="danger" />
      </div>

      <Card>
        <SectionHeader title="Application Portfolio" action={
          <button onClick={() => setShowForm(v => !v)} className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>+ เพิ่ม</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อระบบ *" value={form.application_name} onChange={e => setForm(v => ({ ...v, application_name: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <input placeholder="ประเภท" value={form.application_type} onChange={e => setForm(v => ({ ...v, application_type: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <select value={form.business_criticality} onChange={e => setForm(v => ({ ...v, business_criticality: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— Criticality —</option><option key="critical" value="critical">critical</option><option key="high" value="high">high</option><option key="medium" value="medium">medium</option><option key="low" value="low">low</option></select>
            <div className="flex gap-2">
              <button onClick={create} className="text-xs px-3 py-1.5 rounded text-white" style={{ background: '#02C39A' }}>บันทึก</button>
              <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded text-zinc-600 bg-zinc-100">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr>
                <Th>Code</Th>
                <Th>ชื่อระบบ</Th>
                <Th>Type</Th>
                <Th>Criticality</Th>
                <Th>Lifecycle</Th>
                <Th>Personal Data</Th>
                <Th>AI</Th>
              </tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.application_code}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{r.application_name}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{r.application_type || "—"}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: critBg(r.business_criticality), color: critFg(r.business_criticality) }}>{r.business_criticality}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{(r.lifecycle_status||"").replace(/_/g," ")}</span></Td>
                    <Td>{r.personal_data_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td>{r.ai_enabled_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
