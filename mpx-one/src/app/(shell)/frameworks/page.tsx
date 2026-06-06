'use client'
import useSWR from 'swr'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'
import type { Framework } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url).then(r => r.json())

const TYPE_BADGE: Record<string, string> = {
  regulation:       'bg-red-50    text-red-700',
  standard:         'bg-blue-50   text-blue-700',
  framework:        'bg-purple-50 text-purple-700',
  guideline:        'bg-amber-50  text-amber-700',
  internal_policy:  'bg-zinc-100  text-zinc-700',
}

export default function FrameworksPage() {
  const { data: frameworks, isLoading } = useSWR<Framework[]>(`${API}/api/v1/frameworks`, fetcher)

  const byType = frameworks ? Object.groupBy(frameworks, f => f.type) : {}
  const total    = frameworks?.length ?? 0
  const active   = frameworks?.filter(f => f.status === 'active').length ?? 0
  const builtin  = frameworks?.filter(f => f.is_builtin).length ?? 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KPICard label="Frameworks ทั้งหมด" value={total} />
        <KPICard label="Active" value={active} subVariant="up" />
        <KPICard label="Built-in library" value={builtin} />
      </div>

      <Card>
        <SectionHeader title="Framework Library" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม Framework
          </button>
        } />
        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        ) : !Array.isArray(frameworks) || frameworks.length === 0 ? (
          <Empty />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Framework ID</Th>
                <Th>ชื่อ</Th>
                <Th>Type</Th>
                <Th>หน่วยงาน</Th>
                <Th>Version</Th>
                <Th>Domain</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {frameworks.map(f => (
                <tr key={f.id} className="hover:bg-zinc-50">
                  <Td><span className="font-mono text-[10px] text-zinc-500">{f.framework_id}</span></Td>
                  <Td>
                    <p className="font-medium text-zinc-800">{f.name}</p>
                    {f.description && <p className="text-[10px] text-zinc-400 truncate max-w-xs">{f.description}</p>}
                  </Td>
                  <Td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[f.type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {f.type}
                    </span>
                  </Td>
                  <Td><span className="text-xs text-zinc-600">{f.regulator ?? '—'}</span></Td>
                  <Td><span className="text-xs font-mono">{f.version ?? '—'}</span></Td>
                  <Td><span className="text-xs text-zinc-500">{f.related_domain_code ?? '—'}</span></Td>
                  <Td>
                    <span className={`text-[10px] ${f.status === 'active' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                      {f.status}
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
