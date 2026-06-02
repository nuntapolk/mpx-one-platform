import { KPICard, Card, SectionHeader, ProgressBar } from '@/components/ui'

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="IT Assets (active)"    value="—"  sub="ยังไม่มีข้อมูล" />
        <KPICard label="Open Risks"            value="—"  sub="ยังไม่มีข้อมูล" subVariant="warn" />
        <KPICard label="AI Tools (review)"     value="—"  sub="ยังไม่มีข้อมูล" />
        <KPICard label="Change Requests"       value="—"  sub="ยังไม่มีข้อมูล" subVariant="warn" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Governance modules" />
          <ProgressBar label="IT Governance"   value={0} color="#378ADD" />
          <ProgressBar label="AI Governance"   value={0} color="#7F77DD" />
          <ProgressBar label="Data Governance" value={0} color="#1D9E75" />
          <ProgressBar label="Risk Management" value={0} color="#EF9F27" />
          <ProgressBar label="Reg. Mapping"    value={0} color="#02C39A" />
        </Card>

        <Card>
          <SectionHeader title="System status" />
          <div className="space-y-2 mt-2">
            {[
              { name: 'NestJS API',   status: 'เชื่อมต่อ', ok: true },
              { name: 'PostgreSQL',   status: 'เชื่อมต่อ', ok: true },
              { name: 'Redis',        status: 'เชื่อมต่อ', ok: true },
              { name: 'Keycloak',     status: 'เชื่อมต่อ', ok: true },
              { name: 'MinIO',        status: 'เชื่อมต่อ', ok: true },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
                <span className="text-zinc-700">{s.name}</span>
                <span className={s.ok ? 'text-emerald-600' : 'text-red-600'}>{s.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
