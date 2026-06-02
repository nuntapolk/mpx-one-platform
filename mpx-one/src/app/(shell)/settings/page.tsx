'use client'
import { Card, SectionHeader, Toggle } from '@/components/ui'

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-xl">
      <Card>
        <SectionHeader title="Organization" />
        <div className="space-y-3">
          {[
            { label: 'Organization name', value: 'MPX-ONE', type: 'text' },
            { label: 'Admin email', value: 'admin@mpx.local', type: 'email' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] text-zinc-500 font-medium block mb-1">{f.label}</label>
              <input
                defaultValue={f.value}
                type={f.type}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Notifications" />
        {['แจ้งเตือน Risk level เปลี่ยนแปลง', 'Weekly compliance digest', 'Alert เมื่อมี Change Request ฉุกเฉิน'].map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-100 last:border-0">
            <Toggle enabled={i < 2} onToggle={() => {}} />
            <span className="text-xs text-zinc-700">{item}</span>
          </div>
        ))}
      </Card>

      <Card>
        <SectionHeader title="Tech Stack Info" />
        <div className="space-y-1">
          {[
            ['Frontend', 'Next.js 15 — port 3000'],
            ['API', 'NestJS — port 4000'],
            ['Auth', 'Keycloak — port 8080'],
            ['Database', 'PostgreSQL 16 — port 5432'],
            ['Cache', 'Redis 7 — port 6379'],
            ['Storage', 'MinIO — port 9000'],
            ['Monitor', 'Grafana — port 3001 / Prometheus 9090'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
              <span className="text-zinc-500">{k}</span>
              <span className="text-zinc-700 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
