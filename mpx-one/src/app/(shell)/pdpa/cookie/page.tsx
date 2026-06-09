'use client'
import useSWR from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const ACTION: Record<string,{bg:string;c:string;label:string}> = {
  accept_all: { bg:'#F0FDF4', c:'#166534', label:'ยอมรับทั้งหมด' },
  reject_all: { bg:'#FEF2F2', c:'#991B1B', label:'ปฏิเสธทั้งหมด' },
  custom:     { bg:'#FFFBEB', c:'#92400E', label:'กำหนดเอง' },
}

export default function CookiePage() {
  const { data: stats } = useSWR(`${API}/api/v1/cookie/stats`, fetcher)
  const { data: banners } = useSWR(`${API}/api/v1/cookie/banners`, fetcher)
  const { data: consents } = useSWR(`${API}/api/v1/cookie/consents`, fetcher)
  const bList = Array.isArray(banners) ? banners : []
  const cList = Array.isArray(consents) ? consents : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Consents ทั้งหมด" value={stats?.total_consents ?? '—'} />
        <KPICard label="ยอมรับทั้งหมด" value={stats?.accept_all ?? '—'} subVariant="up" />
        <KPICard label="ปฏิเสธทั้งหมด" value={stats?.reject_all ?? '—'} subVariant="danger" />
        <KPICard label="Accept Rate" value={stats ? `${stats.accept_rate}%` : '—'} subVariant="up" />
        <KPICard label="Banner ใช้งาน" value={stats?.active_banners ?? '—'} />
      </div>

      <Card>
        <SectionHeader title="Cookie Banner Settings" />
        {bList.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {bList.map((b: any) => (
              <div key={b.id} className="p-3 border border-zinc-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-800">{b.banner_title || b.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{b.is_active ? 'active' : 'inactive'}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{b.banner_description}</p>
                <div className="flex gap-2 mt-2">
                  {(b.categories ?? []).map((cat: any, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{cat.label}{cat.required ? ' *' : ''}</span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 mt-2">ตำแหน่ง: {b.position} · เก็บ consent {b.consent_duration_days} วัน</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Cookie Consent Log" />
        {cList.length === 0 ? <Empty /> : (
          <TableWrap>
            <thead><tr><Th>เวลา</Th><Th>Action</Th><Th>ยอมรับ</Th><Th>ปฏิเสธ</Th><Th>Channel</Th></tr></thead>
            <tbody>
              {cList.map((c: any) => {
                const a = ACTION[c.action] ?? ACTION.custom
                return (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <Td><span className="text-[10px] text-zinc-500 font-mono">{c.consented_at ? new Date(c.consented_at).toLocaleString('th-TH', { dateStyle:'short', timeStyle:'short' }) : '—'}</span></Td>
                    <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background:a.bg, color:a.c }}>{a.label}</span></Td>
                    <Td><span className="text-[11px] text-emerald-600">{(c.accepted_categories ?? []).join(', ') || '—'}</span></Td>
                    <Td><span className="text-[11px] text-red-500">{(c.rejected_categories ?? []).join(', ') || '—'}</span></Td>
                    <Td><span className="text-xs text-zinc-500">{c.channel}</span></Td>
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
