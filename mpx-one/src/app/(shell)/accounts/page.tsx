'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import { SECTIONS, ACCESS_LEVELS, accessFor, type AccessLevel } from '@/lib/nav'

const API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const roleColor = (r: string) => (({ admin: ['#fee2e2', '#c0272d'], dpo: ['#ede9fe', '#7c3aed'], viewer: ['#f1f5f9', '#64748b'] } as any)[r] || ['#e0f2fe', '#0369a1'])
const lvlColor = (l: string) => ACCESS_LEVELS.find(a => a.value === l)?.color || '#64748b'

export default function Page() {
  const [tab, setTab] = useState<'users' | 'roles'>('users')
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">👤 Account Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">จัดการบัญชีผู้ใช้ · role · สิทธิ์การเข้าถึงแต่ละเมนู</p>
        </div>
        <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
          <button onClick={() => setTab('users')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === 'users' ? 'glass-tab active' : 'glass-tab'}`}>บัญชีผู้ใช้</button>
          <button onClick={() => setTab('roles')} className={`text-xs px-3 py-1.5 rounded-md font-medium ${tab === 'roles' ? 'glass-tab active' : 'glass-tab'}`}>Roles & Permissions</button>
        </div>
      </div>
      {tab === 'users' ? <UsersTab /> : <RolesTab />}
    </div>
  )
}

/* ── USERS ─────────────────────────────────────────────────── */
function UsersTab() {
  const listKey = `${API}/api/v1/accounts`
  const statsKey = `${API}/api/v1/accounts/stats`
  const { data: list, isLoading } = useSWR(listKey, fetcher)
  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: rolesData } = useSWR(`${API}/api/v1/roles`, fetcher)
  const ROLE_KEYS: string[] = (Array.isArray(rolesData) ? rolesData : []).map((r: any) => r.key)
  const roles = ROLE_KEYS.length ? ROLE_KEYS : ['admin', 'dpo', 'viewer']
  const rows = Array.isArray(list) ? list : []
  const [showForm, setShowForm] = useState(false)
  const blank = { email: '', name: '', roles: ['viewer'] as string[] }
  const [form, setForm] = useState<any>(blank)
  const [err, setErr] = useState('')

  function refresh() { mutate(listKey); mutate(statsKey) }
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
    <>
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="ผู้ใช้ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="ใช้งานอยู่" value={stats?.active ?? '—'} sub="active" />
        <KPICard label="ปิดใช้งาน" value={stats?.inactive ?? '—'} subVariant="warn" sub="inactive" />
        <KPICard label="ผู้ดูแล (admin)" value={stats?.by_role?.admin ?? 0} sub="admin role" />
      </div>
      <Card>
        <SectionHeader title="บัญชีผู้ใช้" action={<button onClick={() => setShowForm(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ เพิ่มผู้ใช้</button>} />
        {showForm && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-1.5 text-xs">{err}</div>}
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="อีเมล *" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="ชื่อ" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-[11px] text-zinc-500">สิทธิ์:</span>
              {roles.map(r => (
                <button key={r} onClick={() => setForm((f: any) => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter((x: string) => x !== r) : [...f.roles, r] }))}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: form.roles.includes(r) ? roleColor(r)[0] : '#f4f4f5', color: form.roles.includes(r) ? roleColor(r)[1] : '#a1a1aa' }}>
                  {form.roles.includes(r) ? '✓ ' : ''}{r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={create} className="glass-btn-primary text-xs px-3 py-1.5 rounded">บันทึก</button>
              <button onClick={() => { setShowForm(false); setErr('') }} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
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
                        {roles.map(r => {
                          const on = (u.roles || []).includes(r)
                          return (
                            <button key={r} onClick={() => setRoles(u.id, on ? u.roles.filter((x: string) => x !== r) : [...(u.roles || []), r])}
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: on ? roleColor(r)[0] : 'transparent', color: on ? roleColor(r)[1] : '#d4d4d8', border: `1px dashed ${on ? 'transparent' : '#e4e4e7'}` }}>{r}</button>
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
    </>
  )
}

/* ── ROLES & PERMISSIONS ───────────────────────────────────── */
function RolesTab() {
  const key = `${API}/api/v1/roles`
  const { data, isLoading } = useSWR(key, fetcher)
  const roles = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, AccessLevel>>({})
  const [showNew, setShowNew] = useState(false)
  const [newRole, setNewRole] = useState({ key: '', label: '', description: '' })
  const [err, setErr] = useState('')

  function startEdit(r: any) { setEditing(r.id); setDraft({ ...(r.permissions || {}) }) }
  async function save(r: any) {
    await fetch(`${key}/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions: draft }) })
    setEditing(null); mutate(key)
  }
  async function createRole() {
    setErr('')
    const res = await fetch(key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRole) })
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d?.message?.message || d?.message || 'สร้างไม่สำเร็จ'); return }
    setShowNew(false); setNewRole({ key: '', label: '', description: '' }); mutate(key)
  }
  async function del(r: any) {
    if (!confirm(`ลบ role "${r.label}"?`)) return
    const res = await fetch(`${key}/${r.id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d?.message?.message || d?.message || 'ลบไม่ได้') }
    mutate(key)
  }
  function setAll(level: AccessLevel) {
    const next: Record<string, AccessLevel> = { '*': level }
    setDraft(next)
  }
  function setItem(navId: string, level: AccessLevel) { setDraft(d => ({ ...d, [navId]: level })) }

  return (
    <>
      <Card>
        <SectionHeader title="Roles" action={<button onClick={() => setShowNew(v => !v)} className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">+ สร้าง Role</button>} />
        {showNew && (
          <div className="mb-4 p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
            {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-1.5 text-xs">{err}</div>}
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="key (เช่น auditor) *" value={newRole.key} onChange={e => setNewRole(n => ({ ...n, key: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="ชื่อแสดง *" value={newRole.label} onChange={e => setNewRole(n => ({ ...n, label: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
              <input placeholder="คำอธิบาย" value={newRole.description} onChange={e => setNewRole(n => ({ ...n, description: e.target.value }))} className="text-xs px-2 py-1.5 border border-zinc-200 rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={createRole} className="glass-btn-primary text-xs px-3 py-1.5 rounded">สร้าง</button>
              <button onClick={() => { setShowNew(false); setErr('') }} className="glass-btn-soft text-xs px-3 py-1.5 rounded">ยกเลิก</button>
            </div>
          </div>
        )}
        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div> : (
          <div className="space-y-2">
            {roles.map((r: any) => (
              <div key={r.id} className="border border-zinc-200 rounded-lg">
                <div className="flex items-center gap-2 p-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: roleColor(r.key)[0], color: roleColor(r.key)[1] }}>{r.key}</span>
                  <span className="font-medium text-sm text-zinc-800">{r.label}</span>
                  {r.is_system && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400">system · ลบไม่ได้</span>}
                  {r.description && <span className="text-[10px] text-zinc-400">{r.description}</span>}
                  <div className="ml-auto flex gap-1">
                    {editing === r.id
                      ? <><button onClick={() => save(r)} className="glass-btn-primary text-[10px] px-2 py-1 rounded">บันทึกสิทธิ์</button>
                          <button onClick={() => setEditing(null)} className="glass-btn-soft text-[10px] px-2 py-1 rounded">ยกเลิก</button></>
                      : <button onClick={() => startEdit(r)} className="glass-btn-soft text-[10px] px-2 py-1 rounded">⚙ ตั้งสิทธิ์</button>}
                    {!r.is_system && editing !== r.id && <button onClick={() => del(r)} className="glass-btn-danger text-[10px] px-2 py-1 rounded">ลบ</button>}
                  </div>
                </div>
                {editing === r.id && (
                  <div className="border-t border-zinc-100 p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500">ตั้งทั้งหมดเป็น:</span>
                      {ACCESS_LEVELS.map(a => (
                        <button key={a.value} onClick={() => setAll(a.value)} className="text-[10px] px-2 py-0.5 rounded border" style={{ color: a.color, borderColor: a.color + '55' }}>{a.label}</button>
                      ))}
                    </div>
                    {SECTIONS.map(sec => (
                      <div key={sec.id}>
                        <div className="text-[10px] font-semibold text-zinc-400 tracking-wide mb-1">{sec.label}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {sec.items.map(item => {
                            const cur = accessFor(draft, item.id)
                            return (
                              <div key={item.id} className="flex items-center gap-2 text-xs">
                                <span className="w-36 truncate text-zinc-600">{item.icon} {item.label}</span>
                                <select value={draft[item.id] ?? cur} onChange={e => setItem(item.id, e.target.value as AccessLevel)}
                                  className="text-[11px] px-1.5 py-1 border border-zinc-200 rounded" style={{ color: lvlColor(draft[item.id] ?? cur) }}>
                                  {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-zinc-400">หมายเหตุ: เมนูที่ตั้งเป็น "ไม่มีสิทธิ์" จะถูกซ่อนจาก sidebar ของผู้ใช้ที่มี role นี้</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
