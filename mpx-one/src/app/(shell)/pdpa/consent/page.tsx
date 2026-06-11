'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  granted:   { bg: '#F0FDF4', color: '#166534', label: 'ยินยอม' },
  withdrawn: { bg: '#FEF2F2', color: '#991B1B', label: 'ถอนความยินยอม' },
  expired:   { bg: '#FFF7ED', color: '#C2410C', label: 'หมดอายุ' },
  denied:    { bg: '#F9FAFB', color: '#6B7280', label: 'ไม่ยินยอม' },
}

export default function ConsentPage() {
  const statsKey = `${API}/api/v1/consent/stats`
  const listKey  = `${API}/api/v1/consent`
  const tmplKey  = `${API}/api/v1/consent/templates/list`
  const subjKey  = `${API}/api/v1/consent/subjects/list`

  const { data: stats } = useSWR(statsKey, fetcher)
  const { data: consents } = useSWR(listKey, fetcher)
  const { data: templates } = useSWR(tmplKey, fetcher)
  const { data: subjects } = useSWR(subjKey, fetcher)

  const [tab, setTab] = useState<'consents' | 'templates' | 'subjects'>('consents')
  const cList = Array.isArray(consents) ? consents : []
  const tList = Array.isArray(templates) ? templates : []
  const sList = Array.isArray(subjects) ? subjects : []
  const subjName = (id: string) => {
    const s = sList.find((x: any) => x.id === id)
    return s ? `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.reference_id : '—'
  }
  const tmplName = (id: string) => tList.find((x: any) => x.id === id)?.name ?? '—'

  async function withdraw(id: string) {
    await fetch(`${API}/api/v1/consent/${id}/withdraw`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'ถอนโดย admin' }),
    })
    mutate(listKey); mutate(statsKey)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-3">
        <KPICard label="Consent ทั้งหมด" value={stats?.total ?? '—'} />
        <KPICard label="ยินยอม"          value={stats?.granted ?? '—'} subVariant="up" />
        <KPICard label="ถอน"             value={stats?.withdrawn ?? '—'} subVariant="danger" />
        <KPICard label="หมดอายุ"         value={stats?.expired ?? '—'} subVariant="warn" />
        <KPICard label="เจ้าของข้อมูล"   value={stats?.data_subjects ?? '—'} />
        <KPICard label="Templates"       value={stats?.active_templates ?? '—'} />
      </div>

      <Card>
        <SectionHeader title="Consent Management" action={
          <div className="flex gap-1">
            {([['consents','Consents'],['templates','Templates'],['subjects','เจ้าของข้อมูล']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`text-[11px] px-3 py-1 rounded-full glass-tab ${tab === k ? 'active' : ''}`}>
                {l}
              </button>
            ))}
          </div>
        } />

        {tab === 'consents' && (
          cList.length === 0 ? <Empty /> : (
            <TableWrap>
              <thead><tr>
                <Th>เจ้าของข้อมูล</Th><Th>วัตถุประสงค์</Th><Th>Channel</Th>
                <Th>สถานะ</Th><Th>วันหมดอายุ</Th><Th>&nbsp;</Th>
              </tr></thead>
              <tbody>
                {cList.map((c: any) => {
                  const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.denied
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50">
                      <Td><span className="font-medium text-zinc-800">{subjName(c.data_subject_id)}</span></Td>
                      <Td><span className="text-xs text-zinc-600">{tmplName(c.template_id)}</span></Td>
                      <Td><span className="text-[11px] text-zinc-500">{c.channel}</span></Td>
                      <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span></Td>
                      <Td><span className="text-xs text-zinc-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('th-TH') : '—'}</span></Td>
                      <Td>{c.is_active && <button onClick={() => withdraw(c.id)} className="glass-btn-danger text-[10px] px-2 py-0.5 rounded">ถอน</button>}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          )
        )}

        {tab === 'templates' && (
          tList.length === 0 ? <Empty /> : (
            <TableWrap>
              <thead><tr><Th>ชื่อ Template</Th><Th>วัตถุประสงค์</Th><Th>Legal Basis</Th><Th>Sensitive</Th><Th>เก็บ (วัน)</Th><Th>Status</Th></tr></thead>
              <tbody>
                {tList.map((t: any) => (
                  <tr key={t.id} className="hover:bg-zinc-50">
                    <Td><span className="font-medium text-zinc-800">{t.name}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{t.purpose}</span></Td>
                    <Td><span className="text-[11px] text-zinc-500">{t.legal_basis}</span></Td>
                    <Td>{t.is_sensitive ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700">Sensitive</span> : <span className="text-zinc-300 text-xs">—</span>}</Td>
                    <Td><span className="text-xs">{t.retention_days ?? '—'}</span></Td>
                    <Td><span className={`text-[10px] ${t.status === 'active' ? 'text-emerald-600' : 'text-zinc-400'}`}>{t.status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )
        )}

        {tab === 'subjects' && (
          sList.length === 0 ? <Empty /> : (
            <TableWrap>
              <thead><tr><Th>Reference</Th><Th>ชื่อ</Th><Th>Type</Th><Th>Email</Th><Th>โทร</Th><Th>Status</Th></tr></thead>
              <tbody>
                {sList.map((s: any) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <Td><span className="font-mono text-[10px] text-zinc-400">{s.reference_id}</span></Td>
                    <Td><span className="font-medium text-zinc-800">{`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()}</span></Td>
                    <Td><span className="text-[11px] text-zinc-500">{s.type}</span></Td>
                    <Td><span className="text-xs text-zinc-600">{s.email}</span></Td>
                    <Td><span className="text-xs text-zinc-500">{s.phone}</span></Td>
                    <Td><span className={`text-[10px] ${s.status === 'active' ? 'text-emerald-600' : 'text-zinc-400'}`}>{s.status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )
        )}
      </Card>
    </div>
  )
}
