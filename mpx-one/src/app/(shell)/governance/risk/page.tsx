import { Card, SectionHeader, KPICard, Empty } from '@/components/ui'

export default function RiskPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Open Risks" value="—" />
        <KPICard label="Critical / High" value="—" subVariant="danger" />
        <KPICard label="In Progress" value="—" subVariant="warn" />
        <KPICard label="Resolved" value="—" subVariant="up" />
      </div>
      <Card>
        <SectionHeader title="Risk Register" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม Risk
          </button>
        } />
        <Empty message="ยังไม่มี Risk — กด เพิ่ม Risk เพื่อเริ่มต้น" />
      </Card>
    </div>
  )
}
