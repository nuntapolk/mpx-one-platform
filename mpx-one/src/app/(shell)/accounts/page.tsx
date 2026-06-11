'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const ROLES = ['admin', 'dpo', 'it-admin', 'viewer']
const roleColor = (r: string) => (({ admin: ['#fee2e2', '#c0272d'], dpo: ['#ede9fe', '#7c3aed'], 'it-admin': ['#fef3c7', '#d97706'], viewer: ['#f1f5f9', '#64748b'] } as any)[r] || ['#f1f5f9', '#64748b'])

export default function Page() {
  const listKey = `${API}/api/v1/accounts`
  const statsKey = `${API}/api/v1/accounts/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const blank = { email: '', name: '', roles: ['viewer'] as string[] }
  const [form, setForm] = useState<any>(blank)
  const [err, setErr] = useState('')

  function refresh() { mutate(listKey); mutate(statsKey) }
  function toggleRole(set: (v: any) => void, cur: string[], r: string) {
    set(cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r])
  }

  async function create() {
    setErr('')
    const res = await fetch(listKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d?.message?.message || d?.message || 'เพิ่มไม่สำเร็จ'); return }
    setShowForm(false); setForm(blank); refresh()
  }
  async function setRoles(id: string, roles: string[]) {
    await fetch(`${listKey}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roles }) }); refresh()
  }
  async function toggleActive(u: any) {
    await fetch(`${listKey}/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !u.is_active }) }); refresh()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">👤 Account Management</h1>
        <p className="text-xs text-zinc-500 mt-0.5">จัดการบัญชีผู้ใช้และสิทธิ์ (role) ภายในองค์กร — ผูกกับ Keycloak ผ่านอีเมล</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ผู้ใช้ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="ใช้งานอยู่" value={stats?.active ?? '—'} sub="active" />
        <KPICard label="ปิดใช้งาน" value={stats?.inactive ?? '—'} subVariant="warn" sub="inactive" />
        <KPICard label="ผู้ดูแล (admin)" value={stats?.by_role?.admin ?? 0} sub="admin role" />
      </div>

      <Card>
        <SectionHeader title="บัญชีผู้ใช้" action={
          <button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่มผู้ใช้</button>
        } />

        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-1.5 text-xs">{err}</div>}
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="อีเมล *" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="ชื่อ" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-[11px] text-zinc-500">สิทธิ์:</span>
              {ROLES.map(r => (
                <button key={r} onClick={() => toggleRole((v) => setForm((f: any) => ({ ...f, roles: v })), form.roles, r)}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: form.roles.includes(r) ? roleColor(r)[0] : '#f4f4f5', color: form.roles.includes(r) ? roleColor(r)[1] : '#a1a1aa', border: form.roles.includes(r) ? `1px solid ${roleColor(r)[1]}33` : '1px solid transparent' }}>
                  {form.roles.includes(r) ? '✓ ' : ''}{r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => { setShowForm(false); setErr('') }} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
            <p className="text-[10px] text-zinc-400">หมายเหตุ: บัญชีต้องถูกสร้างใน Keycloak ด้วย — รายการนี้ map อีเมล → องค์กร + สิทธิ์ในแอป</p>
          </div>
        )}

        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>ผู้ใช้</Th><Th>สิทธิ์ (role)</Th><Th>เข้าระบบล่าสุด</Th><Th>สถานะ</Th><Th>การจัดการ</Th></tr></thead>
              <tbody>
                {rows.map((u: any) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <Td><div className="font-medium text-zinc-800">{u.name || '—'}</div><div className="text-[10px] text-zinc-400">{u.email}</div></Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        {ROLES.map(r => {
                          const on = (u.roles || []).includes(r)
                          return (
                            <button key={r} onClick={() => setRoles(u.id, on ? u.roles.filter((x: string) => x !== r) : [...(u.roles || []), r])}
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: on ? roleColor(r)[0] : 'transparent', color: on ? roleColor(r)[1] : '#d4d4d8', border: `1px dashed ${on ? 'transparent' : '#e4e4e7'}` }}>
                              {r}
                            </button>
                          )
                        })}
                      </div>
                    </Td>
                    <Td><span className="text-[10px] text-zinc-500">{u.last_login_at ? new Date(u.last_login_at).toLocaleString('th-TH') : 'ยังไม่เคย'}</span></Td>
                    <Td><button onClick={() => toggleActive(u)} className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>{u.is_active ? 'active' : 'inactive'}</button></Td>
                    <Td>{u.is_active && <button onClick={() => toggleActive(u)} className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">ปิดใช้งาน</button>}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
