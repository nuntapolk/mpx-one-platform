'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { Card, SectionHeader, KPICard } from '@/components/ui'
import type { AssessmentProgress, AssessmentTemplateControl, AssessmentResponse, Control } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const PASS_FAIL_OPTIONS = [
  { value: 'pass', label: 'Pass ✓',  color: 'bg-emerald-50 border-emerald-400 text-emerald-800' },
  { value: 'fail', label: 'Fail ✗',  color: 'bg-red-50    border-red-400    text-red-800' },
  { value: 'na',   label: 'N/A',     color: 'bg-zinc-50   border-zinc-300   text-zinc-600' },
]

const MATURITY_OPTIONS = [0, 1, 2, 3, 4, 5].map(v => ({
  value: v,
  label: `${v}`,
  desc: ['Not performed', 'Initial', 'Managed', 'Defined', 'Quantitatively', 'Optimizing'][v],
}))

const RISK_OPTIONS = [
  { value: 'low',      label: 'Low',      color: 'bg-green-50  border-green-400  text-green-800'  },
  { value: 'medium',   label: 'Medium',   color: 'bg-amber-50  border-amber-400  text-amber-800'  },
  { value: 'high',     label: 'High',     color: 'bg-orange-50 border-orange-400 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-50    border-red-400    text-red-800'    },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  draft:        { bg: '#f4f4f5', text: '#71717a', label: 'Draft' },
  assigned:     { bg: '#eff6ff', text: '#1d4ed8', label: 'Assigned' },
  in_progress:  { bg: '#fffbeb', text: '#d97706', label: 'In Progress' },
  submitted:    { bg: '#f5f3ff', text: '#7c3aed', label: 'Submitted' },
  under_review: { bg: '#f5f3ff', text: '#7c3aed', label: 'Under Review' },
  approved:     { bg: '#f0fdf4', text: '#15803d', label: 'Approved' },
  rejected:     { bg: '#fef2f2', text: '#b91c1c', label: 'Rejected' },
  closed:       { bg: '#f4f4f5', text: '#52525b', label: 'Closed' },
}

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const progressKey = `${API}/api/v1/assessments/${id}/progress`
  const controlsKey = `${API}/api/v1/assessments/templates/`

  const { data: asm, isLoading } = useSWR<AssessmentProgress>(progressKey, fetcher, { refreshInterval: 5000 })
  const { data: responses } = useSWR<AssessmentResponse[]>(`${API}/api/v1/assessments/${id}/responses`, fetcher)
  const { data: tmplControls } = useSWR<{ template_controls: AssessmentTemplateControl[] }>(
    asm?.template_id ? `${API}/api/v1/assessments/templates/${asm.template_id}/controls` : null,
    fetcher,
  )

  const [saving, setSaving] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  if (isLoading) return <div className="p-8 text-center text-xs text-zinc-400">กำลังโหลด...</div>
  if (!asm) return <div className="p-8 text-center text-xs text-zinc-400">ไม่พบ Assessment</div>

  const statusStyle = STATUS_BADGE[asm.status] ?? { bg: '#f4f4f5', text: '#71717a', label: asm.status }
  const controls    = Array.isArray(tmplControls?.template_controls) ? tmplControls.template_controls : []
  const respMap     = Object.fromEntries((responses ?? []).map(r => [r.control_id, r]))
  const scoringModel = asm.template?.scoring_model ?? 'pass_fail'

  const progress = asm.progress ?? { total: 0, answered: 0, pass: 0, fail: 0, findings: 0, score: null }
  const pct = progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : 0

  async function saveResponse(controlId: string, update: Partial<AssessmentResponse>) {
    setSaving(controlId)
    await fetch(`${API}/api/v1/assessments/${id}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ control_id: controlId, ...update }),
    })
    mutate(`${API}/api/v1/assessments/${id}/responses`)
    mutate(progressKey)
    setSaving(null)
  }

  async function doTransition(action: string, body?: object) {
    await fetch(`${API}/api/v1/assessments/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    mutate(progressKey)
  }

  const canRespond = ['assigned', 'in_progress'].includes(asm.status)

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-zinc-400">{asm.assessment_number}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: statusStyle.bg, color: statusStyle.text }}>
                {statusStyle.label}
              </span>
            </div>
            <h1 className="text-sm font-semibold text-zinc-900">{asm.title}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{asm.template?.name}</p>
          </div>
          <div className="flex gap-2">
            {asm.status === 'draft' && (
              <button onClick={() => doTransition('start')}
                className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">
                เริ่ม Assessment
              </button>
            )}
            {asm.status === 'in_progress' && (
              <button onClick={() => doTransition('submit')}
                className="glass-btn-blue text-xs px-3 py-1.5 rounded-lg">
                Submit for Review
              </button>
            )}
            {asm.status === 'submitted' && (
              <>
                <button onClick={() => doTransition('approve', { comment })}
                  className="glass-btn-emerald text-xs px-3 py-1.5 rounded-lg">
                  Approve
                </button>
                <button onClick={() => doTransition('reject', { comment })}
                  className="glass-btn-danger text-xs px-3 py-1.5 rounded-lg">
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>ความคืบหน้า</span>
            <span>{progress.answered} / {progress.total} ข้อ ({pct}%)</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#02C39A' }} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Controls ทั้งหมด"  value={progress.total} />
        <KPICard label="Pass"  value={progress.pass}   subVariant="up"     sub={progress.total > 0 ? `${Math.round(progress.pass / progress.total * 100)}%` : ''} />
        <KPICard label="Fail"  value={progress.fail}   subVariant="danger" />
        <KPICard label="Findings" value={progress.findings} subVariant={progress.findings > 0 ? 'warn' : undefined} />
      </div>

      {/* Score */}
      {progress.score != null && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold" style={{ color: progress.score >= 80 ? '#1D9E75' : progress.score >= 60 ? '#EF9F27' : '#E24B4A' }}>
              {scoringModel === 'maturity_0_5' ? progress.score : `${progress.score}%`}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {scoringModel === 'pass_fail'
                  ? progress.score >= 80 ? 'Satisfactory' : progress.score >= 60 ? 'Needs Improvement' : 'Unsatisfactory'
                  : scoringModel === 'maturity_0_5'
                  ? `Maturity Level ${progress.score}`
                  : 'Risk Score'}
              </p>
              <p className="text-xs text-zinc-400">{asm.template?.scoring_model}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reviewer comment (if rejected) */}
      {asm.status === 'rejected' && asm.reviewer_comment && (
        <Card>
          <p className="text-xs font-medium text-red-700 mb-1">ความเห็น Reviewer</p>
          <p className="text-xs text-zinc-700">{asm.reviewer_comment}</p>
        </Card>
      )}

      {/* Controls list */}
      <Card>
        <SectionHeader title={`Controls (${controls.length})`} />
        <div className="space-y-3">
          {controls.map((tc, idx) => {
            const ctrl = tc.control
            const resp = ctrl ? respMap[ctrl.id] : undefined
            const isSaving = ctrl && saving === ctrl.id

            return (
              <div key={tc.id} className="border border-zinc-100 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 flex-shrink-0">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-zinc-400">{ctrl?.control_id}</span>
                      {resp && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">ตอบแล้ว</span>}
                      {isSaving && <span className="text-[10px] text-zinc-400">บันทึก...</span>}
                    </div>
                    <p className="text-xs font-medium text-zinc-800 mb-1">{ctrl?.name}</p>
                    {ctrl?.expected_evidence && (
                      <p className="text-[11px] text-zinc-400">หลักฐาน: {ctrl.expected_evidence}</p>
                    )}

                    {canRespond && ctrl && (
                      <div className="mt-3 space-y-2">
                        {/* Scoring input */}
                        {scoringModel === 'pass_fail' && (
                          <div className="flex gap-2">
                            {PASS_FAIL_OPTIONS.map(opt => (
                              <button key={opt.value}
                                onClick={() => saveResponse(ctrl.id, { pass_fail: opt.value as any })}
                                className={`text-[11px] px-3 py-1 rounded-full border-2 font-medium transition-all ${resp?.pass_fail === opt.value ? opt.color + ' border-opacity-100' : 'bg-white border-zinc-200 text-zinc-500'}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {scoringModel === 'maturity_0_5' && (
                          <div className="flex gap-1.5 flex-wrap">
                            {MATURITY_OPTIONS.map(opt => (
                              <button key={opt.value}
                                onClick={() => saveResponse(ctrl.id, { maturity_score: opt.value })}
                                title={opt.desc}
                                className={`text-[11px] w-8 h-8 rounded-lg border-2 font-medium transition-all ${resp?.maturity_score === opt.value ? 'border-[#02C39A] bg-[#E6FAF6] text-[#02C39A]' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {scoringModel === 'risk_based' && (
                          <div className="flex gap-2">
                            {RISK_OPTIONS.map(opt => (
                              <button key={opt.value}
                                onClick={() => saveResponse(ctrl.id, { risk_rating: opt.value })}
                                className={`text-[11px] px-3 py-1 rounded-full border-2 font-medium transition-all ${resp?.risk_rating === opt.value ? opt.color : 'bg-white border-zinc-200 text-zinc-500'}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Comment + Finding */}
                        <div className="flex gap-2">
                          <input
                            defaultValue={resp?.comment ?? ''}
                            placeholder="หมายเหตุ (optional)"
                            onBlur={e => e.target.value !== (resp?.comment ?? '') && saveResponse(ctrl.id, { comment: e.target.value })}
                            className="flex-1 text-xs px-2 py-1 border border-zinc-200 rounded focus:outline-none focus:border-[#02C39A]"
                          />
                          <label className="flex items-center gap-1.5 text-[11px] text-zinc-600 cursor-pointer">
                            <input type="checkbox"
                              checked={resp?.has_finding ?? false}
                              onChange={e => saveResponse(ctrl.id, { has_finding: e.target.checked })}
                            />
                            Finding
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Read-only response */}
                    {!canRespond && resp && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                        {resp.pass_fail && <span className={`px-2 py-0.5 rounded-full font-medium ${resp.pass_fail === 'pass' ? 'bg-emerald-50 text-emerald-700' : resp.pass_fail === 'fail' ? 'bg-red-50 text-red-700' : 'bg-zinc-50 text-zinc-600'}`}>{resp.pass_fail.toUpperCase()}</span>}
                        {resp.maturity_score != null && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Level {resp.maturity_score}</span>}
                        {resp.risk_rating && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">{resp.risk_rating}</span>}
                        {resp.comment && <span className="text-zinc-400">{resp.comment}</span>}
                        {resp.has_finding && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">⚠ Finding</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {controls.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-4">ไม่มี controls ใน template นี้</p>
          )}
        </div>
      </Card>

      {/* Reviewer comment input */}
      {asm.status === 'submitted' && (
        <Card>
          <SectionHeader title="Reviewer Comment" />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="ความเห็นสำหรับ approve/reject..."
            rows={3}
            className="w-full text-xs px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#02C39A]"
          />
        </Card>
      )}
    </div>
  )
}
