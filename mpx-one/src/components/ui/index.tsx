'use client'
import type { RiskLevel, StatusType, DataClassification, AITier, ChangeType, TreatmentType } from '@/types'

// ── Badge base ──────────────────────────────────────────────────
function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${className}`}>
      {children}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  active:        'bg-emerald-50 text-emerald-800 border-emerald-200',
  approved:      'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed:     'bg-emerald-50 text-emerald-800 border-emerald-200',
  open:          'bg-blue-50    text-blue-800    border-blue-200',
  review:        'bg-amber-50   text-amber-800   border-amber-200',
  pending:       'bg-amber-50   text-amber-800   border-amber-200',
  in_progress:   'bg-amber-50   text-amber-800   border-amber-200',
  rejected:      'bg-red-50     text-red-800     border-red-200',
  overdue:       'bg-red-50     text-red-800     border-red-200',
  inactive:      'bg-zinc-100   text-zinc-600    border-zinc-200',
  decommissioned:'bg-zinc-100   text-zinc-600    border-zinc-200',
  accepted:      'bg-zinc-100   text-zinc-600    border-zinc-200',
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
  return <Badge className={style}>{status.replace('_', ' ')}</Badge>
}

const RISK_STYLES: Record<RiskLevel, string> = {
  critical: 'bg-red-50   text-red-800   border-red-200',
  high:     'bg-amber-50 text-amber-800 border-amber-200',
  medium:   'bg-amber-50 text-amber-800 border-amber-200',
  low:      'bg-green-50 text-green-800 border-green-200',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge className={RISK_STYLES[level]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>
}

export function RiskDot({ level }: { level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-amber-400', low: 'bg-emerald-500',
  }
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[level]}`} />
}

const CLASS_STYLES: Record<DataClassification, string> = {
  confidential: 'bg-red-50   text-red-800   border-red-200',
  sensitive:    'bg-red-50   text-red-800   border-red-200',
  internal:     'bg-amber-50 text-amber-800 border-amber-200',
  public:       'bg-blue-50  text-blue-800  border-blue-200',
}
const CLASS_LABELS: Record<DataClassification, string> = {
  confidential: 'Confidential', sensitive: 'Sensitive', internal: 'Internal', public: 'Public',
}
export function ClassificationBadge({ value }: { value: DataClassification }) {
  return <Badge className={CLASS_STYLES[value]}>{CLASS_LABELS[value]}</Badge>
}

const TIER_STYLES: Record<AITier, string> = {
  1: 'bg-red-50    text-red-800',
  2: 'bg-amber-50  text-amber-800',
  3: 'bg-blue-50   text-blue-800',
  4: 'bg-green-50  text-green-800',
}
export function TierBadge({ tier }: { tier: AITier }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${TIER_STYLES[tier]}`}>
      Tier {tier}
    </span>
  )
}

const CHANGE_STYLES: Record<ChangeType, string> = {
  normal:    'bg-blue-50  text-blue-800  border-blue-200',
  standard:  'bg-amber-50 text-amber-800 border-amber-200',
  emergency: 'bg-red-50   text-red-800   border-red-200',
}
export function ChangeBadge({ type }: { type: ChangeType }) {
  const labels: Record<ChangeType, string> = { normal: 'Normal', standard: 'Standard', emergency: 'Emergency' }
  return <Badge className={CHANGE_STYLES[type]}>{labels[type]}</Badge>
}

const TREATMENT_STYLES: Record<TreatmentType, string> = {
  mitigate: 'bg-blue-50   text-blue-800   border-blue-200',
  transfer: 'bg-purple-50 text-purple-800 border-purple-200',
  accept:   'bg-gray-50   text-gray-700   border-gray-200',
  avoid:    'bg-red-50    text-red-800    border-red-200',
}
export function TreatmentBadge({ treatment }: { treatment: TreatmentType }) {
  return <Badge className={TREATMENT_STYLES[treatment]}>{treatment.charAt(0).toUpperCase() + treatment.slice(1)}</Badge>
}

// ── KPI Card ───────────────────────────────────────────────────
export function KPICard({ label, value, sub, subVariant }: {
  label: string; value: string | number; sub?: string; subVariant?: 'up' | 'warn' | 'danger'
}) {
  const subColor = { up: 'text-emerald-600', warn: 'text-amber-600', danger: 'text-red-600' }[subVariant ?? 'up']
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 leading-none">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
export function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Toggle ─────────────────────────────────────────────────────
export function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#02C39A]' : 'bg-zinc-300 dark:bg-zinc-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-[14px]' : ''}`} />
    </button>
  )
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
      {action}
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-medium px-3 py-2 text-left border-b border-zinc-200 dark:border-zinc-700 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2.5 text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 ${className}`}>
      {children}
    </td>
  )
}

// ── Empty state ────────────────────────────────────────────────
export function Empty({ message = 'ไม่มีข้อมูล' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-zinc-400 text-sm">
      {message}
    </div>
  )
}
