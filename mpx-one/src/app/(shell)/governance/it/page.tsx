import { Card, SectionHeader, TableWrap, Th, Td, KPICard, ChangeBadge, StatusBadge, Empty } from '@/components/ui'

export default function ITGovernancePage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="IT Assets" value="—" sub="ยังไม่มีข้อมูล" />
        <KPICard label="Change Requests" value="—" sub="เดือนนี้" subVariant="warn" />
        <KPICard label="Policy compliance" value="—%" />
        <KPICard label="SLA breach" value="—" subVariant="danger" />
      </div>

      <Card>
        <SectionHeader title="IT Assets" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + เพิ่ม Asset
          </button>
        } />
        <Empty message="ยังไม่มี IT Asset — กด เพิ่ม Asset เพื่อเริ่มต้น" />
      </Card>

      <Card>
        <SectionHeader title="Change Requests" action={
          <button className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: '#02C39A' }}>
            + สร้าง Request
          </button>
        } />
        <Empty message="ยังไม่มี Change Request" />
      </Card>
    </div>
  )
}
