'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, SectionHeader, Empty } from '@/components/ui'
import type { AssessmentTemplate } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TYPE_LABELS: Record<string, string> = {
  control_self_assessment: 'Control Self-Assessment',
  risk_assessment:         'Risk Assessment',
  maturity_assessment:     'Maturity Assessment',
  pdpa_assessment:         'PDPA Assessment',
  it_risk_assessment:      'IT Risk Assessment',
  third_party_assessment:  'Third Party Assessment',
  ai_assessment:           'AI Assessment',
}

const DOMAIN_COLORS: Record<string, string> = {
  PDPA:        '#1D9E75',
  IT_RISK:     '#EF9F27',
  IT_GOV:      '#378ADD',
  AI:          '#7F77DD',
  THIRD_PARTY: '#888780',
  CYBER:       '#E24B4A',
  DATA:        '#02C39A',
}

const SCORING_LABELS: Record<string, string> = {
  pass_fail:    '✓ Pass / Fail',
  maturity_0_5: '★ Maturity 0–5',
  risk_based:   '⚠ Risk-based',
}

export default function TemplatesPage() {
  const { data: templates, isLoading } = useSWR<AssessmentTemplate[]>(`${API}/api/v1/assessments/templates`, fetcher)

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Assessment Templates" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + สร้าง Template
          </button>
        } />

        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
        ) : !Array.isArray(templates) || templates.length === 0 ? (
          <Empty message="ยังไม่มี Assessment Template" />
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {templates.map(t => (
              <div key={t.id} className="border border-zinc-200 rounded-xl p-4 hover:border-[#02C39A] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ background: DOMAIN_COLORS[t.related_domain_code] ?? '#888' }}>
                    {t.related_domain_code}
                  </span>
                  <span className="text-[10px] text-zinc-400">{t.frequency}</span>
                </div>
                <p className="text-xs font-semibold text-zinc-800 mb-1">{t.name}</p>
                <p className="text-[11px] text-zinc-500 mb-3 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">{TYPE_LABELS[t.type] ?? t.type}</span>
                  <span className="text-[11px] font-medium" style={{ color: '#02C39A' }}>
                    {SCORING_LABELS[t.scoring_model]}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/assessments/templates/${t.id}`}
                    className="flex-1 text-center text-[11px] py-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:border-[#02C39A] hover:text-[#02C39A] transition-colors">
                    ดูรายละเอียด
                  </Link>
                  <CreateFromTemplate templateId={t.id} templateName={t.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function CreateFromTemplate({ templateId, templateName }: { templateId: string; templateName: string }) {
  async function create() {
    const res = await fetch(`${API}/api/v1/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, title: templateName }),
    })
    const data = await res.json()
    if (data?.id) window.location.href = `/assessments/${data.id}`
  }
  return (
    <button onClick={create}
      className="flex-1 text-[11px] py-1.5 rounded-lg text-white"
      style={{ background: '#02C39A' }}>
      + สร้าง Assessment
    </button>
  )
}
