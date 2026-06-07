'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Card, SectionHeader, TableWrap, Th, Td, Empty } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function ImportExportPage() {
  const { data: types } = useSWR(`${API}/api/v1/import-export/types`, fetcher)
  const typeList = Array.isArray(types) ? types : []

  const [selected, setSelected] = useState('applications')
  const [preview, setPreview] = useState<any>(null)
  const [committing, setCommitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  function download(path: string, filename: string) {
    const a = document.createElement('a')
    a.href = `${API}/api/v1/import-export/${path}`
    a.download = filename
    a.click()
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API}/api/v1/import-export/preview/${selected}`, { method: 'POST', body: fd })
    setPreview(await res.json())
  }

  async function commit() {
    if (!preview) return
    setCommitting(true)
    const validRows = preview.rows.filter((r: any) => r.valid).map((r: any) => r.data)
    const res = await fetch(`${API}/api/v1/import-export/commit/${selected}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: validRows }),
    })
    setResult(await res.json())
    setPreview(null)
    setCommitting(false)
  }

  return (
    <div className="space-y-4">
      {/* Export section */}
      <Card>
        <SectionHeader title="Export Data" />
        <p className="text-xs text-zinc-500 mb-3">ดาวน์โหลดข้อมูลเป็น Excel เพื่อทำรายงานหรือ backup</p>
        <div className="grid grid-cols-3 gap-3">
          {typeList.map((t: any) => (
            <div key={t.type} className="border border-zinc-200 rounded-lg p-3">
              <p className="text-xs font-medium text-zinc-800 capitalize mb-2">{t.type.replace('-', ' ')}</p>
              <div className="flex gap-2">
                <button onClick={() => download(`export/${t.type}`, `${t.type}-export.xlsx`)}
                  className="glass-btn-primary flex-1 text-[11px] py-1.5 rounded">
                  ⬇ Export
                </button>
                <button onClick={() => download(`template/${t.type}`, `${t.type}-template.xlsx`)}
                  className="flex-1 text-[11px] py-1.5 rounded border border-zinc-200 text-zinc-600 hover:border-[#02C39A]">
                  Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Import section */}
      <Card>
        <SectionHeader title="Import Data" />
        <div className="flex items-center gap-3 mb-3">
          <select value={selected} onChange={e => { setSelected(e.target.value); setPreview(null); setResult(null) }}
            className="text-xs px-3 py-2 border border-zinc-200 rounded-lg">
            {typeList.map((t: any) => <option key={t.type} value={t.type}>{t.type}</option>)}
          </select>
          <label className="glass-btn-blue text-xs px-3 py-2 rounded-lg cursor-pointer">
            เลือกไฟล์ Excel
            <input type="file" accept=".xlsx,.xls" onChange={onUpload} className="hidden" />
          </label>
          <span className="text-[11px] text-zinc-400">ดาวน์โหลด Template ก่อน แล้วกรอกข้อมูล</span>
        </div>

        {result && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-3">
            ✅ Import สำเร็จ — สร้างใหม่ {result.created} · อัปเดต {result.updated} · ข้าม {result.skipped} จาก {result.total} แถว
          </div>
        )}

        {preview && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-zinc-600">พบ {preview.total} แถว</span>
              <span className="text-[11px] text-emerald-600">✓ ถูกต้อง {preview.valid}</span>
              {preview.invalid > 0 && <span className="text-[11px] text-red-600">✗ ผิดพลาด {preview.invalid}</span>}
              <button onClick={commit} disabled={committing || preview.valid === 0}
                className="ml-auto text-xs px-3 py-1.5 rounded-lg text-white"
                style={{ background: '#02C39A', opacity: committing || preview.valid === 0 ? 0.5 : 1 }}>
                {committing ? 'กำลัง import...' : `Import ${preview.valid} แถว`}
              </button>
            </div>
            {preview.rows.length === 0 ? <Empty message="ไม่พบข้อมูลในไฟล์" /> : (
              <TableWrap>
                <thead><tr><Th>แถว</Th><Th>สถานะ</Th><Th>ข้อมูล</Th><Th>Errors</Th></tr></thead>
                <tbody>
                  {preview.rows.slice(0, 50).map((r: any) => (
                    <tr key={r.row_number} className={r.valid ? '' : 'bg-red-50'}>
                      <Td>{r.row_number}</Td>
                      <Td>{r.valid ? <span className="text-emerald-600 text-xs">✓</span> : <span className="text-red-600 text-xs">✗</span>}</Td>
                      <Td><span className="text-[11px] text-zinc-600">{Object.values(r.data).filter(Boolean).slice(0, 3).join(' · ')}</span></Td>
                      <Td><span className="text-[10px] text-red-500">{r.errors.join(', ')}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
