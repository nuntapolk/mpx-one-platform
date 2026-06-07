import { Card, SectionHeader, KPICard, Empty } from '@/components/ui'

export default function DataGovernancePage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Data Assets" value="—" />
        <KPICard label="Data quality avg" value="—%" />
        <KPICard label="Sensitive data" value="—" subVariant="warn" />
        <KPICard label="Lineage tracked" value="—%" />
      </div>
      <Card>
        <SectionHeader title="Data Asset Catalog" action={
          <button className="glass-btn-primary text-xs px-3 py-1.5 rounded-lg">
            + เพิ่ม Asset
          </button>
        } />
        <Empty message="ยังไม่มี Data Asset — กด เพิ่ม Asset เพื่อเริ่มต้น" />
      </Card>
    </div>
  )
}
