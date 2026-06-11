'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function AdminPage() {
  const { data: cats } = useSWR(`${API}/api/v1/admin/lookups/categories`, fetcher)
  const catList = Array.isArray(cats) ? cats : []
  const [selected, setSelected] = useState<string>('')
  const active = selected || (catList[0]?.category ?? '')

  const { data: items } = useSWR(active ? `${API}/api/v1/admin/lookups?category=${active}` : null, fetcher)
  const itemList = Array.isArray(items) ? items : []

  const [newVal, setNewVal] = useState('')
  const [newLabel, setNewLabel] = useState('')

  async function addItem() {
    if (!newVal) return
    await fetch(`${API}/api/v1/admin/lookups`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: active, value: newVal, label: newLabel || newVal, display_order: itemList.length }),
    })
    mutate(`${API}/api/v1/admin/lookups?category=${active}`)
    mutate(`${API}/api/v1/admin/lookups/categories`)
    setNewVal(''); setNewLabel('')
  }

  async function toggle(id: string) {
    await fetch(`${API}/api/v1/admin/lookups/${id}`, { method: 'DELETE' })
    mutate(`${API}/api/v1/admin/lookups?category=${active}`)
  }

  return (
    <div className="flex gap-4">
      {/* Category list */}
      <Card className="w-64 flex-shrink-0">
        <SectionHeader title="Lookup Categories" />
        <div className="space-y-0.5">
          {catList.map((c: any) => (
            <button key={c.category} onClick={() => setSelected(c.category)}
              className={`w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg text-left transition-colors glass-tab ${active === c.category ? 'active' : ''}`}>
              <span>{c.category.replace(/_/g, ' ')}</span>
              <span className="text-[10px] opacity-70">{c.count}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Items */}
      <div className="flex-1">
        <Card>
          <SectionHeader title={`Values — ${active.replace(/_/g, ' ')}`} />
          <div className="flex gap-2 mb-3">
            <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="value (เช่น new_value)"
              className="flex-1 text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="label (แสดงผล)"
              className="flex-1 text-xs px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]" />
            <button onClick={addItem} className="glass-btn-primary text-xs px-3 py-1.5 rounded">+ เพิ่ม</button>
          </div>
          {itemList.length === 0 ? <Empty /> : (
            <TableWrap>
              <thead><tr><Th>Order</Th><Th>Value</Th><Th>Label</Th><Th>Built-in</Th><Th>Status</Th><Th>&nbsp;</Th></tr></thead>
              <tbody>
                {itemList.map((i: any) => (
                  <tr key={i.id} className={i.is_active ? '' : 'opacity-50'}>
                    <Td><span className="text-xs text-zinc-400">{i.display_order}</span></Td>
                    <Td><span className="font-mono text-[11px]">{i.value}</span></Td>
                    <Td><span className="text-xs">{i.label}</span></Td>
                    <Td>{i.is_builtin ? <span className="text-[10px] text-zinc-400">built-in</span> : <span className="text-[10px] text-blue-600">custom</span>}</Td>
                    <Td><span className={`text-[10px] ${i.is_active ? 'text-emerald-600' : 'text-zinc-400'}`}>{i.is_active ? 'active' : 'inactive'}</span></Td>
                    <Td>{i.is_active && <button onClick={() => toggle(i.id)} className="text-[10px] text-red-500 hover:underline">deactivate</button>}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      </div>
    </div>
  )
}
