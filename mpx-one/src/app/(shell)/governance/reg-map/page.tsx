import { Card, SectionHeader, KPICard, Empty } from '@/components/ui'

export default function RegMapPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Controls ทั้งหมด" value="—" />
        <KPICard label="Mapped" value="—" subVariant="up" />
        <KPICard label="Partial" value="—" subVariant="warn" />
        <KPICard label="Not mapped" value="—" subVariant="danger" />
      </div>
      <Card>
        <SectionHeader title="Regulatory Mapping" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม Mapping
          </button>
        } />
        <Empty message="ยังไม่มี Mapping — กด เพิ่ม Mapping เพื่อเริ่มต้น" />
      </Card>
    </div>
  )
}
