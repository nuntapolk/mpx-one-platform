'use client'
import { Card, SectionHeader, Toggle } from '@/components/ui'

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Organization */}
      <Card>
        <SectionHeader title="Organization" />
        <div className="space-y-3">
          {[
            { label: 'Organization name', value: 'MPX-ONE Default Org', type: 'text' },
            { label: 'Admin email', value: 'admin@mpx.local', type: 'email' },
            { label: 'DPO email', value: 'dpo@mpx.local', type: 'email' },
            { label: 'Plan', value: 'Enterprise', type: 'text' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] text-zinc-500 font-medium block mb-1">{f.label}</label>
              <input defaultValue={f.value} type={f.type}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800" />
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionHeader title="Notifications & SLA" />
        {[
          { label: 'แจ้งเตือน Risk level เปลี่ยนแปลง', on: true },
          { label: 'แจ้งเตือน Action Plan ที่ overdue', on: true },
          { label: 'แจ้งเตือน Evidence ที่กำลังหมดอายุ (30 วัน)', on: true },
          { label: 'Weekly governance digest', on: false },
          { label: 'แจ้งเตือน Assessment ที่ overdue', on: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-100 last:border-0">
            <Toggle enabled={item.on} onToggle={() => {}} />
            <span className="text-xs text-zinc-700">{item.label}</span>
          </div>
        ))}
      </Card>

      {/* Tech Stack Info */}
      <Card>
        <SectionHeader title="Platform Information" />
        <div className="space-y-0 divide-y divide-zinc-100">
          {[
            ['Frontend',  'Next.js 15 (App Router)',            'http://localhost:3000'],
            ['API',       'NestJS + TypeORM',                   'http://localhost:4000/api/docs'],
            ['Auth',      'Keycloak 24',                        'http://localhost:8080'],
            ['Database',  'PostgreSQL 16',                      'localhost:5433'],
            ['Cache',     'Redis 7',                            'localhost:6379'],
            ['Storage',   'MinIO',                              'http://localhost:9001'],
            ['Monitor',   'Grafana + Prometheus',               'http://localhost:3001'],
          ].map(([k, v, url]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <span className="text-xs text-zinc-500 w-24">{k}</span>
              <span className="flex-1 text-xs text-zinc-700">{v}</span>
              {url && <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">Open →</a>}
            </div>
          ))}
        </div>
      </Card>

      {/* Roles */}
      <Card>
        <SectionHeader title="Roles (Keycloak)" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { role: 'admin',    desc: 'System Admin — ดูแลระบบทั้งหมด' },
            { role: 'dpo',      desc: 'DPO — บริหาร PDPA Governance' },
            { role: 'it-admin', desc: 'IT Admin — IT Governance & Risk' },
            { role: 'viewer',   desc: 'Viewer — ดูข้อมูลอย่างเดียว' },
          ].map(r => (
            <div key={r.role} className="p-3 border border-zinc-200 rounded-lg">
              <p className="text-xs font-medium text-zinc-800">{r.role}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
