'use client'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, SectionHeader, KPICard, TableWrap, Th, Td, StatusBadge, Empty } from '@/components/ui'
import type { Assessment, AssessmentStats } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const SCORING_LABELS: Record<string, string> = {
  pass_fail: 'Pass / Fail',
  maturity_0_5: 'Maturity 0–5',
  risk_based: 'Risk-based',
}

const STATUS_COLOR: Record<string, string> = {
  draft:        'text-zinc-400',
  assigned:     'text-blue-600',
  in_progress:  'text-amber-600',
  submitted:    'text-purple-600',
  under_review: 'text-purple-600',
  approved:     'text-emerald-600',
  rejected:     'text-red-600',
  closed:       'text-zinc-500',
}

export default function AssessmentsPage() {
  const { data: stats } = useSWR<AssessmentStats>(`${API}/api/v1/assessments/stats`, fetcher)
  const { data: list, isLoading } = useSWR<Assessment[]>(`${API}/api/v1/assessments`, fetcher)
  const { data: templates } = useSWR(`${API}/api/v1/assessments/templates`, fetcher)
  const [tab, setTab] = useState<'all' | 'my'>('all')

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="ทั้งหมด"       value={stats?.total ?? '—'} />
        <KPICard label="กำลังดำเนินการ" value={stats?.in_progress ?? '—'} subVariant="warn" />
        <KPICard label="รอ review"      value={stats?.submitted ?? '—'} subVariant="warn" />
        <KPICard label="Overdue"        value={stats?.overdue ?? '—'} subVariant="danger" />
        <KPICard label="Approved"       value={stats?.approved ?? '—'} subVariant="up" />
      </div>

      {/* Templates quick-start */}
      {templates && Array.isArray(templates) && templates.length > 0 && (
        <Card>
          <SectionHeader title="Assessment Templates" action={
            <Link href="/assessments/templates" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</Link>
          } />
          <div className="grid grid-cols-3 gap-3 mt-2">
            {templates.slice(0, 3).map((t: any) => (
              <div key={t.id} className="border border-zinc-200 rounded-lg p-3 hover:border-[#02C39A] transition-colors">
                <p className="text-xs font-medium text-zinc-800 mb-1">{t.name}</p>
                <p className="text-[11px] text-zinc-400">{SCORING_LABELS[t.scoring_model] || t.scoring_model}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{t.related_domain_code}</p>
                <CreateAssessmentButton templateId={t.id} templateName={t.name} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assessment list */}
      <Card>
        <SectionHeader title="รายการ Assessment" action={
          <div className="flex gap-2">
            {(['all', 'my'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs px-3 py-1 rounded-full transition-colors glass-tab ${tab === t ? 'active' : ''}`}>
                {t === 'all' ? 'ทั้งหมด' : 'ของฉัน'}
              </button>
            ))}
          </div>
        } />
        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        ) : !Array.isArray(list) || list.length === 0 ? (
          <Empty message="ยังไม่มี Assessment — สร้างจาก template ด้านบน" />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Assessment</Th>
                <Th>สถานะ</Th>
                <Th>คะแนน</Th>
                <Th>วันกำหนด</Th>
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id} className="hover:bg-zinc-50">
                  <Td>
                    <p className="font-medium text-zinc-800">{a.title}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{a.assessment_number}</p>
                  </Td>
                  <Td>
                    <span className={`text-xs font-medium ${STATUS_COLOR[a.status] ?? 'text-zinc-600'}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </Td>
                  <Td>
                    {a.score != null
                      ? <span className={`font-medium ${a.score >= 80 ? 'text-emerald-600' : a.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{a.score}%</span>
                      : <span className="text-zinc-300">—</span>
                    }
                  </Td>
                  <Td>{a.due_date ? new Date(a.due_date).toLocaleDateString('th-TH') : '—'}</Td>
                  <Td>
                    <Link href={`/assessments/${a.id}`} className="text-xs text-blue-600 hover:underline">เปิด</Link>
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

function CreateAssessmentButton({ templateId, templateName }: { templateId: string; templateName: string }) {
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId, title: templateName }),
      })
      const data = await res.json()
      if (data?.id) window.location.href = `/assessments/${data.id}`
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="mt-2 w-full text-[10px] py-1 rounded text-white transition-opacity"
      style={{ background: '#02C39A', opacity: loading ? 0.6 : 1 }}
    >
      {loading ? 'สร้าง...' : '+ สร้าง Assessment'}
    </button>
  )
}
