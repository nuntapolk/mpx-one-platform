import { Card, SectionHeader, KPICard, Empty } from '@/components/ui'

export default function AIGovernancePage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="AI Tools assessed" value="—" />
        <KPICard label="รอ approve" value="—" subVariant="warn" />
        <KPICard label="Tier 1 (High risk)" value="—" subVariant="danger" />
        <KPICard label="Approved" value="—" subVariant="up" />
      </div>
      <Card>
        <SectionHeader title="AI Tool Registry" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม AI Tool
          </button>
        } />
        <Empty message="ยังไม่มี AI Tool ที่ถูก assess — กด เพิ่ม AI Tool เพื่อเริ่มต้น" />
      </Card>
    </div>
  )
}
