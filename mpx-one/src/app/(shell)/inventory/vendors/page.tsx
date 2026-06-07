'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

function critBg(v: string) { return { critical:'#FEF2F2', high:'#FFFBEB', medium:'#F0F9FF', low:'#F0FDF4' }[v] || '#f4f4f5' }
function critFg(v: string) { return { critical:'#B91C1C', high:'#D97706', medium:'#0369A1', low:'#166534' }[v] || '#71717a' }

export default function Page() {
  const listKey = `${API}/api/v1/vendors`
  const statsKey = `${API}/api/v1/vendors/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vendor_name: "", vendor_type: "", risk_level: "" })

  const rows = Array.isArray(list) ? list : []

  async function create() {
    await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey)
    setShowForm(false)
    setForm({ vendor_name: "", vendor_type: "", risk_level: "" })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? "—"} />
      </div>

      <Card>
        <SectionHeader title="Vendor / Third Party Registry" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input placeholder="ชื่อ Vendor *" value={form.vendor_name} onChange={e => setForm(v => ({ ...v, vendor_name: e.target.value }))} className="w-full text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <select value={form.vendor_type} onChange={e => setForm(v => ({ ...v, vendor_type: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— Type —</option><option key="software_vendor" value="software_vendor">software_vendor</option><option key="cloud_provider" value="cloud_provider">cloud_provider</option><option key="outsourcing_provider" value="outsourcing_provider">outsourcing_provider</option><option key="data_processor" value="data_processor">data_processor</option><option key="ai_tool_provider" value="ai_tool_provider">ai_tool_provider</option><option key="consultant" value="consultant">consultant</option><option key="infrastructure_provider" value="infrastructure_provider">infrastructure_provider</option><option key="other" value="other">other</option></select>
            <select value={form.risk_level} onChange={e => setForm(v => ({ ...v, risk_level: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— Risk —</option><option key="critical" value="critical">critical</option><option key="high" value="high">high</option><option key="medium" value="medium">medium</option><option key="low" value="low">low</option></select>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr>
                <Th>Code</Th>
                <Th>ชื่อ Vendor</Th>
                <Th>Type</Th>
                <Th>Critical</Th>
                <Th>DPA</Th>
                <Th>SLA</Th>
                <Th>Risk</Th>
              </tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{r.vendor_code}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{r.vendor_name}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{r.vendor_type || "—"}</span></Td>
                    <Td>{r.critical_vendor_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td>{r.dpa_available_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td>{r.sla_available_flag ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: critBg(r.risk_level), color: critFg(r.risk_level) }}>{r.risk_level}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
