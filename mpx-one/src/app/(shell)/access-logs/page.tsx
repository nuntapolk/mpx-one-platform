'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const actColor = (a: string) => (({ read: ['#eff6ff', '#1d4ed8'], search: ['#f5f3ff', '#7c3aed'], export: ['#fffbeb', '#d97706'], download: ['#fffbeb', '#d97706'] } as any)[a] || ['#f1f5f9', '#64748b'])
const sevColor = (s: string) => (({ info: '#64748b', warn: '#d97706', critical: '#c0272d' } as any)[s] || '#64748b')
const SENSITIVE = ['national_id', 'health', 'biometric', 'criminal']

function IntegrityBadge() {
  const [state, setState] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  async function verify() {
    setBusy(true)
    try { const r = await fetch(`${API}/api/v1/access-logs/verify`, { cache: 'no-store' }); setState(await r.json()) }
    finally { setBusy(false) }
  }
  return (
    <div className="text-right">
      <button onClick={verify} disabled={busy} className="glass-btn-soft text-xs px-3 py-1.5 rounded-lg">
        {busy ? 'กำลังตรวจ...' : '🔐 ตรวจสอบความครบถ้วน (hash chain)'}
      </button>
      {state && (
        <div className="mt-1 text-[11px]" style={{ color: state.valid ? '#15803d' : '#c0272d' }}>
          {state.valid ? `✓ สมบูรณ์ — ${state.total} records (ไม่มีการแก้ไข)` : `✗ ตรวจพบการแก้ไข! broken at ${String(state.broken_at).slice(0, 8)}`}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [filter, setFilter] = useState<string>('all')
  const qs = filter === 'export' ? '?action=export' : filter === 'sensitive' ? '' : filter !== 'all' ? `?action=${filter}` : ''
  const { data: list, isLoading } = useSWR(`${API}/api/v1/access-logs${qs}&limit=300`, fetcher)
  const { data: stats } = useSWR(`${API}/api/v1/access-logs/stats`, fetcher)
  let rows = Array.isArray(list) ? list : []
  if (filter === 'sensitive') rows = rows.filter((r: any) => (r.pii_categories || []).some((c: string) => SENSITIVE.includes(c)))

  const FILTERS = [['all', 'ทั้งหมด'], ['read', 'อ่าน'], ['search', 'ค้นหา'], ['export', 'ส่งออก'], ['sensitive', '🔴 ข้อมูลอ่อนไหว']]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">🔍 Access Logs — บันทึกการเข้าถึงข้อมูลส่วนบุคคล</h1>
          <p className="text-xs text-zinc-500 mt-0.5">บันทึก immutable การอ่าน/ค้นหา/ส่งออกข้อมูลส่วนบุคคล (PDPA ม.37 · ISO 27701)</p>
        </div>
        <IntegrityBadge />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard label="เหตุการณ์ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="การส่งออก (export)" value={stats?.exports ?? '—'} subVariant="warn" sub="ต้องเฝ้าระวัง" />
        <KPICard label="แตะข้อมูลอ่อนไหว" value={stats?.pii_sensitive ?? '—'} subVariant="danger" sub="national_id/health/..." />
        <KPICard label="ประเภททรัพยากร" value={stats?.by_resource ? Object.keys(stats.by_resource).length : '—'} />
      </div>

      <Card>
        <SectionHeader title="เหตุการณ์ล่าสุด" action={
          <div className="flex gap-1">{FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`text-[11px] px-2.5 py-1 rounded-md ${filter === k ? 'glass-btn-primary' : 'glass-btn-soft'}`}>{l}</button>
          ))}</div>
        } />
        {isLoading ? <div className="py-6 text-center text-xs text-zinc-400">กำลังโหลด...</div>
          : rows.length === 0 ? <Empty />
          : (
            <TableWrap>
              <thead><tr><Th>เวลา</Th><Th>ผู้ใช้</Th><Th>การกระทำ</Th><Th>ทรัพยากร</Th><Th>ข้อมูล (PII)</Th><Th>จำนวน</Th><Th>IP</Th></tr></thead>
              <tbody>
                {rows.map((r: any) => {
                  const sensitive = (r.pii_categories || []).some((c: string) => SENSITIVE.includes(c))
                  return (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <Td><span className="text-[10px] text-zinc-500">{new Date(r.created_at).toLocaleString('th-TH')}</span></Td>
                      <Td><span className="text-xs text-zinc-700">{r.user_email || '—'}</span>{r.user_roles?.[0] && <span className="ml-1 text-[9px] text-zinc-400">{r.user_roles[0]}</span>}</Td>
                      <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: actColor(r.action)[0], color: actColor(r.action)[1] }}>{r.action}</span></Td>
                      <Td><span className="text-xs text-zinc-600">{r.resource_type}</span>{r.resource_id && <span className="block text-[9px] font-mono text-zinc-400">{String(r.resource_id).slice(0, 8)}</span>}</Td>
                      <Td>
                        <div className="flex gap-1 flex-wrap">
                          {(r.pii_categories || []).map((c: string) => (
                            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: SENSITIVE.includes(c) ? '#fee2e2' : '#f1f5f9', color: SENSITIVE.includes(c) ? '#c0272d' : '#64748b' }}>{SENSITIVE.includes(c) ? '🔴 ' : ''}{c}</span>
                          ))}
                        </div>
                      </Td>
                      <Td><span className="text-xs text-zinc-500">{r.record_count ?? '—'}</span></Td>
                      <Td><span className="text-[10px] font-mono text-zinc-400">{r.ip_address || '—'}</span>{sensitive && <span className="ml-1" title="severity warn" style={{ color: sevColor(r.severity) }}>●</span>}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </div>
  )
}
