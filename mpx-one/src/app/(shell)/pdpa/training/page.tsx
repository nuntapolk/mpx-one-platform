'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())
function cb(v:string){return ({critical:'#FEF2F2',high:'#FFFBEB',medium:'#F0F9FF',low:'#F0FDF4'} as any)[v]||'#f4f4f5'}
function cf(v:string){return ({critical:'#B91C1C',high:'#D97706',medium:'#0369A1',low:'#166534'} as any)[v]||'#71717a'}

export default function Page() {
  const listKey = `${API}/api/v1/training`
  const statsKey = `${API}/api/v1/training/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ title: "", duration_minutes: "", passing_score: "" })

  async function create() {
    await fetch(listKey, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    mutate(listKey); mutate(statsKey); setShowForm(false); setForm({ title: "", duration_minutes: "", passing_score: "" })
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
        <SectionHeader title="Training Courses" action={
          <button onClick={()=>setShowForm(v=>!v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่ม</button>
        } />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            <input type="text" placeholder="ชื่อคอร์ส *" value={form.title} onChange={e=>setForm((v:any)=>({...v,title:e.target.value}))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input type="number" placeholder="ระยะเวลา (นาที)" value={form.duration_minutes} onChange={e=>setForm((v:any)=>({...v,duration_minutes:+e.target.value}))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            <input type="number" placeholder="คะแนนผ่าน" value={form.passing_score} onChange={e=>setForm((v:any)=>({...v,passing_score:+e.target.value}))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
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
              <thead><tr><Th>คอร์ส</Th><Th>นาที</Th><Th>ผ่านที่</Th><Th>บังคับ</Th><Th>Active</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {rows.map((r:any)=>(
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <Td><span className="font-medium text-zinc-800">{r.title}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{(r.duration_minutes!=null&&r.duration_minutes!=="")?String(r.duration_minutes).replace(/_/g," "):"—"}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{(r.passing_score!=null&&r.passing_score!=="")?String(r.passing_score).replace(/_/g," "):"—"}</span></Td>
                    <Td>{r.is_required ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td>{r.is_active ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yes</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
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
