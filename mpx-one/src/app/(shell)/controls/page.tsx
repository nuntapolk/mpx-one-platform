'use client'
import useSWR from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import type { Control } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const DOMAIN_COLORS: Record<string, string> = {
  PDPA:'#1D9E75', IT_RISK:'#EF9F27', IT_GOV:'#378ADD',
  AI:'#7F77DD', THIRD_PARTY:'#888780', CYBER:'#E24B4A', DATA:'#02C39A',
}

const CRIT_COLORS: Record<string, string> = {
  critical: 'text-red-600', high: 'text-amber-600', medium: 'text-zinc-600', low: 'text-green-600',
}

export default function ControlsPage() {
  const { data: controls, isLoading } = useSWR<Control[]>(`${API}/api/v1/controls`, fetcher)

  const groups = controls ? Object.groupBy(controls, c => c.related_domain_code ?? 'OTHER') : {}
  const total  = controls?.length ?? 0
  const critical = controls?.filter(c => c.criticality === 'critical').length ?? 0
  const high     = controls?.filter(c => c.criticality === 'high').length ?? 0
  const builtin  = controls?.filter(c => c.is_builtin).length ?? 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Controls ทั้งหมด" value={total} />
        <KPICard label="Critical" value={critical} subVariant="danger" />
        <KPICard label="High" value={high} subVariant="warn" />
        <KPICard label="Built-in" value={builtin} subVariant="up" sub="จาก MPX-ONE library" />
      </div>

      <Card>
        <SectionHeader title="Unified Control Library" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม Control
          </button>
        } />
        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        ) : !Array.isArray(controls) || controls.length === 0 ? (
          <Empty />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Control ID</Th>
                <Th>ชื่อ Control</Th>
                <Th>Type</Th>
                <Th>Domain</Th>
                <Th>Criticality</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {controls.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <Td><span className="font-mono text-[10px] text-zinc-500">{c.control_id}</span></Td>
                  <Td>
                    <p className="font-medium text-zinc-800">{c.name}</p>
                    {c.objective && <p className="text-[10px] text-zinc-400 truncate max-w-xs">{c.objective}</p>}
                  </Td>
                  <Td><span className="capitalize text-xs">{c.type}</span></Td>
                  <Td>
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-white"
                      style={{ background: DOMAIN_COLORS[c.related_domain_code ?? ''] ?? '#888' }}>
                      {c.related_domain_code}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-xs font-medium capitalize ${CRIT_COLORS[c.criticality]}`}>
                      {c.criticality}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-[10px] ${c.status === 'active' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                      {c.status}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  )
}
