'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())
function cb(v:string){return ({critical:'#FEF2F2',high:'#FFFBEB',medium:'#F0F9FF',low:'#F0FDF4'} as any)[v]||'#f4f4f5'}
function cf(v:string){return ({critical:'#B91C1C',high:'#D97706',medium:'#0369A1',low:'#166534'} as any)[v]||'#71717a'}

export default function Page() {
  const listKey = `${API}/api/v1/ropa-campaigns`
  const statsKey = `${API}/api/v1/ropa-campaigns/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ name: "", mode: "" })

  async function create() {
    await fetch(listKey, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); setShowForm(false); setForm({ name: "", mode: "" })
  }
  async function del(id:string) {
    await fetch(`${listKey}/${id}`, { method:'DELETE' }); mutate(listKey); mutate(statsKey)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ทั้งหมด" value={stats?.total ?? "—"} />
        {stats?.by_status && Object.entries(stats.by_status).slice(0,3).map(([k,v]:any)=>(
          <KPICard key={k} label={String(k).replace(/_/g," ")} value={v as any} />
        ))}
      </div>
      <Card>
        <SectionHeader title="ROPA Campaigns" action={
          <button onClick={()=>setShowForm(v=>!v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม</button>
        } />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input type="text" placeholder="ชื่อ Campaign *" value={form.name} onChange={e=>setForm((v:any)=>({...v,name:e.target.value}))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <select value={form.mode} onChange={e=>setForm((v:any)=>({...v,mode:e.target.value}))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded"><option value="">— Mode —</option><option key="collect" value="collect">collect</option><option key="review" value="review">review</option><option key="update" value="update">update</option></select>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={()=>setShowForm(false)} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}
        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length===0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>Campaign</Th><Th>Mode</Th><Th>สถานะ</Th><Th>Deadline</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {rows.map((r:any)=>(
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-medium text-zinc-800">{r.name}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{(r.mode!=null&&r.mode!=="")?String(r.mode).replace(/_/g," "):"—"}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{(r.status!=null&&r.status!=="")?String(r.status).replace(/_/g," "):"—"}</span></Td>
                    <Td><span className="text-xs text-zinc-500">{r.deadline ? new Date(r.deadline).toLocaleDateString("th-TH") : "—"}</span></Td>
                    <Td><button onClick={()=>del(r.id)} title="ลบ" className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">🗑️</button></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
