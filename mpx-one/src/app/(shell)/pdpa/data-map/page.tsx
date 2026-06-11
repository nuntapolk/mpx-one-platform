'use client'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Card, KPICard, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

const TYPE_COLOR: Record<string, string> = {
  processor: '#1d4ed8', data_processor: '#1d4ed8', controller: '#15572e', data_controller: '#15572e',
  joint_controller: '#7c3aed', sub_processor: '#0369a1', recipient: '#d97706',
  third_party: '#64748b', supervisory_authority: '#c0272d',
}
const TYPE_LABEL: Record<string, string> = {
  processor: '⚙️ Processor', data_processor: '⚙️ Data Processor', controller: '🏢 Controller',
  data_controller: '🏢 Data Controller', joint_controller: '🤝 Joint Controller',
  sub_processor: '🔗 Sub-Processor', recipient: '📤 Recipient', third_party: '👥 Third Party',
  supervisory_authority: '⚖️ Supervisory',
}
const tc = (t: string) => TYPE_COLOR[t] || '#64748b'
const tl = (t: string) => TYPE_LABEL[t] || t
const riskColor = (r: string) => (({ low: '#15572e', medium: '#d97706', high: '#c0272d', critical: '#7f1d1d' } as any)[r] || '#64748b')
const riskBg = (r: string) => (({ low: '#dcfce7', medium: '#fef3c7', high: '#fee2e2', critical: '#fde8d8' } as any)[r] || '#f1f5f9')
const dpaLabel = (s: string) => (({ active: '✓ Active', expiring: '⏰ Expiring', expired: '✗ Expired', pending: '… Pending', none: '— ไม่มี' } as any)[s] || s)
const dpaBg = (s: string) => (({ active: ['#dcfce7', '#15572e'], expiring: ['#fef3c7', '#d97706'], expired: ['#fee2e2', '#c0272d'], pending: ['#eef2ff', '#4f46e5'], none: ['#f1f5f9', '#64748b'] } as any)[s] || ['#f1f5f9', '#64748b'])

const TABS = [
  { id: 'map', label: '🗺️ Map' },
  { id: 'table', label: '📋 Table' },
  { id: 'flows', label: '🔀 Data Flows' },
  { id: 'rel', label: '🔗 Relationships' },
]

export default function Page() {
  const { data, isLoading } = useSWR(`${API}/api/v1/data-map`, fetcher)
  const [tab, setTab] = useState('map')
  const stats = data?.stats || {}
  const flows: any[] = Array.isArray(data?.flows) ? data.flows : []
  const ropaFlows: any[] = Array.isArray(data?.ropaFlows) ? data.ropaFlows : []
  const rels: any[] = Array.isArray(data?.relationships) ? data.relationships : []
  const grouped: Record<string, number> = data?.grouped || {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">🗺️ Data Map</h1>
          <p className="text-xs text-zinc-500 mt-0.5">แผนที่การไหลของข้อมูลส่วนบุคคลระหว่างองค์กร</p>
        </div>
        <div className="inline-flex gap-0.5 p-1 rounded-lg bg-zinc-100/60">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${tab === t.id ? 'glass-tab active' : 'glass-tab'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <KPICard label="External Parties" value={stats.total_parties ?? '—'} />
        <KPICard label="มี Active DPA" value={stats.with_active_dpa ?? '—'} />
        <KPICard label="Cross-border" value={stats.cross_border ?? '—'} />
        <KPICard label="ความเสี่ยงสูง/วิกฤต" value={stats.high_risk ?? '—'} />
        <KPICard label="ไม่มี DPA (ต้องการ)" value={stats.no_dpa ?? '—'} />
      </div>

      {isLoading ? <Card><div className="py-10 text-center text-xs text-zinc-400">กำลังโหลด...</div></Card> : (
        <>
          {tab === 'map' && <MapView flows={flows} grouped={grouped} />}
          {tab === 'table' && <TableView flows={flows} />}
          {tab === 'flows' && <FlowsView ropaFlows={ropaFlows} />}
          {tab === 'rel' && <RelView rels={rels} />}
        </>
      )}
    </div>
  )
}

/* ── MAP: hub-and-spoke ─────────────────────────────────────── */
function MapView({ flows, grouped }: { flows: any[]; grouped: Record<string, number> }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [sel, setSel] = useState<any>(null)
  const TYPE_ORDER = ['data_processor', 'processor', 'sub_processor', 'data_controller', 'controller', 'joint_controller', 'recipient', 'third_party', 'supervisory_authority']

  useEffect(() => {
    const ordered = [...flows].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))
    function layout() {
      const canvas = canvasRef.current, svg = svgRef.current
      if (!canvas || !svg) return
      const W = canvas.offsetWidth || 900, H = canvas.offsetHeight || 700
      if (W < 100) return
      const cx = W / 2, cy = H / 2, nodeW = 136, nodeH = 68
      const total = ordered.length
      const innerCount = Math.min(total, 6), outerCount = total - innerCount
      const R1 = Math.min(W, H) * 0.30, R2 = Math.min(W, H) * 0.45
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      ordered.forEach((n, i) => {
        const isInner = i < innerCount
        const idx = isInner ? i : i - innerCount
        const cnt = isInner ? innerCount : (outerCount || 1)
        const r = isInner ? R1 : R2
        const angle = (2 * Math.PI * idx / cnt) - Math.PI / 2
        const nx = cx + r * Math.cos(angle) - nodeW / 2
        const ny = cy + r * Math.sin(angle) - nodeH / 2
        const el = document.getElementById('dm-node-' + n.id)
        if (el) {
          el.style.left = Math.max(4, Math.min(W - nodeW - 4, nx)) + 'px'
          el.style.top = Math.max(4, Math.min(H - nodeH - 4, ny)) + 'px'
        }
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy))
        line.setAttribute('x2', String(cx + r * Math.cos(angle))); line.setAttribute('y2', String(cy + r * Math.sin(angle)))
        line.setAttribute('stroke', tc(n.type)); line.setAttribute('stroke-width', '1.5')
        line.setAttribute('opacity', '0.4'); line.setAttribute('stroke-dasharray', '6 4')
        svg.appendChild(line)
      })
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    }
    const canvas = canvasRef.current
    let ro: ResizeObserver | undefined
    if (canvas && window.ResizeObserver) {
      let timer: any
      ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(layout, 50) })
      ro.observe(canvas)
    }
    layout()
    window.addEventListener('resize', layout)
    return () => { ro?.disconnect(); window.removeEventListener('resize', layout) }
  }, [flows])

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center gap-5 px-5 py-3 flex-wrap bg-zinc-50 border-b border-zinc-200">
        {Object.entries(grouped).map(([type, cnt]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: tc(type) }} />
            <span className="text-zinc-700">{tl(type)}</span>
            <span className="font-bold" style={{ color: tc(type) }}>{cnt}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-zinc-400">
          <span>🔴 Critical/High</span><span>🌐 Cross-border</span>
        </div>
      </div>
      <div ref={canvasRef} className="relative w-full p-6" style={{ minHeight: 700, overflow: 'hidden' }}>
        <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none', zIndex: 5 }} />
        <div className="absolute flex flex-col items-center justify-center text-center text-white font-bold"
          style={{ width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg,#15572e,#2a6b4d)', boxShadow: '0 4px 24px rgba(21,87,46,.35)', zIndex: 20, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', border: '3px solid #3a8762' }}>
          <div style={{ fontSize: 22 }}>🏛️</div>
          <div style={{ fontSize: 13 }}>องค์กรของเรา</div>
          <div style={{ fontSize: 10, opacity: .8 }}>Data Controller</div>
        </div>
        {flows.length === 0 && <div className="absolute inset-0 flex items-center justify-center"><Empty message="ยังไม่มี External Party" /></div>}
        {flows.map(p => {
          const riskGlow = p.risk === 'critical' ? '0 0 0 2px #dc2626' : p.risk === 'high' ? '0 0 0 2px #d97706' : ''
          const selGlow = sel?.id === p.id ? `0 0 0 3px ${tc(p.type)}` : ''
          return (
            <div key={p.id} id={'dm-node-' + p.id} onClick={() => setSel(sel?.id === p.id ? null : p)}
              className="absolute cursor-pointer transition"
              style={{ width: 136, background: '#fff', borderRadius: 12, padding: '10px 12px', border: `2px solid ${tc(p.type)}`, boxShadow: selGlow || riskGlow || '0 2px 10px rgba(0,0,0,.08)', zIndex: 10, fontSize: 12 }}>
              <div className="font-semibold truncate" style={{ color: tc(p.type), fontSize: 11 }}>{p.name}</div>
              {p.code && <div style={{ color: '#94a3b8', fontSize: 10 }}>{p.code}</div>}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {p.cross && <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: 9, padding: '1px 4px', borderRadius: 4 }}>🌐</span>}
                {p.dpa_status === 'active' ? <span style={{ background: '#dcfce7', color: '#15572e', fontSize: 9, padding: '1px 4px', borderRadius: 4 }}>✓ DPA</span>
                  : (p.dpa_status === 'none' && ['processor', 'controller', 'joint_controller', 'data_processor', 'data_controller'].includes(p.type)) ? <span style={{ background: '#fee2e2', color: '#c0272d', fontSize: 9, padding: '1px 4px', borderRadius: 4 }}>⚠️ No DPA</span> : null}
                {['high', 'critical'].includes(p.risk) && <span style={{ background: '#fee2e2', color: '#c0272d', fontSize: 9, padding: '1px 4px', borderRadius: 4 }}>{String(p.risk).toUpperCase()}</span>}
              </div>
            </div>
          )
        })}
        {sel && (
          <div className="absolute" style={{ right: 16, top: 16, width: 280, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 4px 24px rgba(0,0,0,.12)', zIndex: 30, maxHeight: 'calc(100% - 32px)', overflowY: 'auto' }}>
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-bold text-sm" style={{ color: '#15572e' }}>{sel.name}</h3><div className="text-xs text-zinc-400">{sel.code}</div></div>
              <button onClick={() => setSel(null)} className="text-zinc-400 text-lg leading-none">×</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex gap-2"><span className="text-zinc-500">ความสัมพันธ์:</span><span className="font-medium" style={{ color: tc(sel.type) }}>{tl(sel.type)}</span></div>
              <div className="flex gap-2"><span className="text-zinc-500">Risk:</span><span className="font-bold uppercase" style={{ color: riskColor(sel.risk) }}>{sel.risk}</span></div>
              <div className="flex gap-2"><span className="text-zinc-500">DPA:</span><span className="font-medium">{dpaLabel(sel.dpa_status)}</span></div>
              <div className="flex gap-2"><span className="text-zinc-500">ประเทศ:</span><span>{sel.country || '—'}</span></div>
              {sel.cross && <div className="rounded-lg p-2 mt-1" style={{ background: '#fff7ed' }}><div className="font-medium" style={{ color: '#c2410c' }}>🌐 Cross-border</div><div style={{ color: '#92400e' }}>{(sel.countries || []).join(', ') || '—'}</div></div>}
              {sel.data_types?.length > 0 && <div className="mt-1"><div className="font-medium mb-1 text-zinc-700">ประเภทข้อมูล:</div><div className="flex flex-wrap gap-1">{sel.data_types.map((d: string) => <span key={d} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">{d}</span>)}</div></div>}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

/* ── TABLE ───────────────────────────────────────────────────── */
function TableView({ flows }: { flows: any[] }) {
  return (
    <Card>
      {flows.length === 0 ? <Empty message="ยังไม่มี External Party" /> : (
        <TableWrap>
          <thead><tr><Th>ชื่อ / Code</Th><Th>Relationship</Th><Th>Risk</Th><Th>DPA</Th><Th>Cross-border</Th><Th>สถานะ</Th></tr></thead>
          <tbody>
            {flows.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <Td><div className="font-medium text-zinc-800">{p.name}</div>{p.code && <div className="text-[10px] font-mono text-zinc-400">{p.code}</div>}</Td>
                <Td><span className="text-xs font-medium" style={{ color: tc(p.type) }}>{tl(p.type)}</span></Td>
                <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: riskBg(p.risk), color: riskColor(p.risk) }}>{p.risk}</span></Td>
                <Td><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: dpaBg(p.dpa_status)[0], color: dpaBg(p.dpa_status)[1] }}>{dpaLabel(p.dpa_status)}</span></Td>
                <Td>{p.cross ? <span className="text-xs text-orange-700">🌐 {(p.countries || []).join(', ') || 'Yes'}</span> : <span className="text-zinc-300">—</span>}</Td>
                <Td><span className="text-xs capitalize text-zinc-500">{p.status}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Card>
  )
}

/* ── DATA FLOWS (ROPA → recipient) ───────────────────────────── */
function FlowsView({ ropaFlows }: { ropaFlows: any[] }) {
  const withRecipient = ropaFlows.filter(r => r.recipient || r.cross_border)
  if (withRecipient.length === 0) return <Card><Empty message="ยังไม่มี Data Flow — เพิ่ม recipient/cross-border ใน ROPA" /></Card>
  return (
    <div className="space-y-3">
      {withRecipient.map(r => (
        <Card key={r.id}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] text-zinc-400">{r.ropa_code}</span>
            <h3 className="font-semibold text-sm" style={{ color: '#15572e' }}>{r.process_name}</h3>
            {r.risk && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: riskBg(r.risk), color: riskColor(r.risk) }}>{r.risk}</span>}
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg text-sm bg-zinc-50">
            <div className="text-center" style={{ minWidth: 120 }}>
              <div className="font-semibold" style={{ color: '#15572e' }}>องค์กรของเรา</div>
              <div className="text-[10px] text-zinc-400">{r.department || 'ผู้ควบคุม'}</div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="flex-1 border-t-2 border-dashed border-zinc-300" />
              <span className="px-2 py-0.5 rounded text-[10px] font-medium border" style={{ color: r.cross_border ? '#c2410c' : '#1d4ed8', borderColor: r.cross_border ? '#c2410c' : '#1d4ed8' }}>{r.cross_border ? '🌐 Cross-border' : '📤 Transfer'}</span>
              <span className="text-zinc-400">→</span>
              <div className="flex-1 border-t-2 border-dashed border-zinc-300" />
            </div>
            <div className="text-center" style={{ minWidth: 120 }}>
              <div className="font-semibold text-zinc-700">{r.recipient || '—'}</div>
              <div className="text-[10px] text-zinc-400">{r.cross_border ? (r.countries || []).join(', ') || 'ต่างประเทศ' : 'ผู้รับข้อมูล'}</div>
            </div>
            {r.data_category && <div className="flex flex-wrap gap-1 max-w-[160px]">{String(r.data_category).split(',').slice(0, 3).map((c: string, i: number) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">{c.trim()}</span>)}</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ── RELATIONSHIPS (ROPA ↔ DPIA ↔ recipient) ─────────────────── */
function RelView({ rels }: { rels: any[] }) {
  if (rels.length === 0) return <Card><Empty message="ยังไม่มี ROPA Records" /></Card>
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">แสดงความสัมพันธ์ระหว่าง ROPA ↔ DPIA ↔ ผู้รับข้อมูล</p>
      {rels.map(r => (
        <Card key={r.id}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: '#15803d' }}>
              {String(r.ropa_code || 'R').replace('ROPA-', '').slice(0, 4)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-zinc-800 truncate">{r.process_name}</div>
              <div className="flex gap-2 mt-0.5 items-center flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ background: '#f1f5f9', color: '#64748b' }}>{r.status}</span>
                {r.risk && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{ background: riskBg(r.risk), color: riskColor(r.risk) }}>{r.risk}</span>}
                {r.dpia_required && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#fef3c7', color: '#d97706' }}>DPIA Required</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2 rounded-lg bg-zinc-50">
              <div className="text-[10px] text-zinc-400 mb-1">◑ DPIA</div>
              {r.dpia ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">{r.dpia.dpia_number}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ background: '#eef2ff', color: '#4f46e5' }}>{String(r.dpia.status).replace(/_/g, ' ')}</span>
                  {r.dpia.residual && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: riskBg(r.dpia.residual), color: riskColor(r.dpia.residual) }}>residual: {r.dpia.residual}</span>}
                </div>
              ) : <span className="text-[10px] text-zinc-300">— ไม่มี DPIA</span>}
            </div>
            <div className="p-2 rounded-lg bg-zinc-50">
              <div className="text-[10px] text-zinc-400 mb-1">📤 ผู้รับข้อมูล</div>
              <div className="text-xs text-zinc-700">{r.recipient || '—'}{r.cross_border && <span className="ml-1 text-orange-600">🌐</span>}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
