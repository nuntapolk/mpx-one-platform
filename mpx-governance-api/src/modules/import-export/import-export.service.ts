import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import * as ExcelJS from 'exceljs'

import { Application } from '../../database/entities/application.entity'
import { Vendor } from '../../database/entities/vendor.entity'
import { Control } from '../../database/entities/control.entity'
import { RiskRegister } from '../../database/entities/risk-register.entity'
import { DataAssetInventory } from '../../database/entities/data-asset-inventory.entity'
import { RopaActivity } from '../../database/entities/ropa.entity'

// Registry: type → { entity, codeField, columns[], required[] }
type Col = { key: string; label: string }
interface TypeConfig {
  entity: any
  codeField: string
  columns: Col[]
  required: string[]
}

const REGISTRY: Record<string, TypeConfig> = {
  applications: {
    entity: Application, codeField: 'application_code',
    required: ['application_name'],
    columns: [
      { key: 'application_code', label: 'Application Code' },
      { key: 'application_name', label: 'Application Name' },
      { key: 'application_type', label: 'Type' },
      { key: 'business_criticality', label: 'Criticality' },
      { key: 'lifecycle_status', label: 'Lifecycle Status' },
      { key: 'hosting_type', label: 'Hosting Type' },
      { key: 'personal_data_flag', label: 'Personal Data (Y/N)' },
      { key: 'description', label: 'Description' },
    ],
  },
  vendors: {
    entity: Vendor, codeField: 'vendor_code',
    required: ['vendor_name'],
    columns: [
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'vendor_name', label: 'Vendor Name' },
      { key: 'vendor_type', label: 'Type' },
      { key: 'risk_level', label: 'Risk Level' },
      { key: 'critical_vendor_flag', label: 'Critical (Y/N)' },
      { key: 'dpa_available_flag', label: 'DPA (Y/N)' },
      { key: 'service_description', label: 'Service Description' },
    ],
  },
  controls: {
    entity: Control, codeField: 'control_id',
    required: ['name'],
    columns: [
      { key: 'control_id', label: 'Control ID' },
      { key: 'name', label: 'Control Name' },
      { key: 'type', label: 'Type' },
      { key: 'criticality', label: 'Criticality' },
      { key: 'related_domain_code', label: 'Domain' },
      { key: 'objective', label: 'Objective' },
    ],
  },
  risks: {
    entity: RiskRegister, codeField: 'risk_id',
    required: ['title'],
    columns: [
      { key: 'risk_id', label: 'Risk ID' },
      { key: 'title', label: 'Risk Title' },
      { key: 'category', label: 'Category' },
      { key: 'likelihood', label: 'Likelihood (1-5)' },
      { key: 'impact', label: 'Impact (1-5)' },
      { key: 'treatment', label: 'Treatment' },
    ],
  },
  'data-assets': {
    entity: DataAssetInventory, codeField: 'data_asset_code',
    required: ['data_asset_name'],
    columns: [
      { key: 'data_asset_code', label: 'Data Asset Code' },
      { key: 'data_asset_name', label: 'Data Asset Name' },
      { key: 'data_domain', label: 'Domain' },
      { key: 'classification', label: 'Classification' },
      { key: 'personal_data_flag', label: 'Personal Data (Y/N)' },
    ],
  },
  ropa: {
    entity: RopaActivity, codeField: 'ropa_code',
    required: ['processing_activity_name'],
    columns: [
      { key: 'ropa_code', label: 'ROPA Code' },
      { key: 'processing_activity_name', label: 'Processing Activity' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'lawful_basis', label: 'Lawful Basis' },
      { key: 'risk_level', label: 'Risk Level' },
    ],
  },
}

const BOOL_FIELDS = new Set([
  'personal_data_flag', 'sensitive_data_flag', 'critical_vendor_flag',
  'dpa_available_flag', 'sla_available_flag',
])
const NUM_FIELDS = new Set(['likelihood', 'impact'])

@Injectable()
export class ImportExportService {
  constructor(@InjectDataSource() private ds: DataSource) {}

  listTypes() {
    return Object.entries(REGISTRY).map(([type, cfg]) => ({
      type,
      columns: cfg.columns.map(c => c.label),
      required: cfg.required,
    }))
  }

  private cfg(type: string): TypeConfig {
    const c = REGISTRY[type]
    if (!c) throw new BadRequestException(`Unknown import/export type: ${type}`)
    return c
  }

  // ── Export ───────────────────────────────────────────────────
  async exportExcel(type: string, orgId: string): Promise<Buffer> {
    const cfg = this.cfg(type)
    const repo = this.ds.getRepository(cfg.entity)
    const rows = await repo.find({ where: { organization_id: orgId } })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(type)
    ws.columns = cfg.columns.map(c => ({ header: c.label, key: c.key, width: 24 }))
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1B3E' } }
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    for (const r of rows as any[]) {
      const obj: any = {}
      for (const c of cfg.columns) {
        let v = r[c.key]
        if (BOOL_FIELDS.has(c.key)) v = v ? 'Y' : 'N'
        obj[c.key] = v ?? ''
      }
      ws.addRow(obj)
    }
    return (await wb.xlsx.writeBuffer()) as unknown as Buffer
  }

  async exportTemplate(type: string): Promise<Buffer> {
    const cfg = this.cfg(type)
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(type)
    ws.columns = cfg.columns.map(c => ({ header: c.label, key: c.key, width: 24 }))
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF02C39A' } }
    return (await wb.xlsx.writeBuffer()) as unknown as Buffer
  }

  // ── Import: parse Excel buffer → rows ────────────────────────
  async parseExcel(type: string, buffer: Buffer): Promise<Record<string, any>[]> {
    const cfg = this.cfg(type)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer as any)
    const ws = wb.worksheets[0]
    if (!ws) return []

    // Map header labels → keys
    const headerRow = ws.getRow(1)
    const labelToKey: Record<number, string> = {}
    headerRow.eachCell((cell, col) => {
      const label = String(cell.value ?? '').trim()
      const found = cfg.columns.find(c => c.label === label || c.key === label)
      if (found) labelToKey[col] = found.key
    })

    const rows: Record<string, any>[] = []
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i)
      const obj: any = {}
      let hasData = false
      for (const [colStr, key] of Object.entries(labelToKey)) {
        const cell = row.getCell(Number(colStr))
        let v: any = cell.value
        if (v && typeof v === 'object' && 'text' in v) v = (v as any).text
        if (v !== null && v !== undefined && v !== '') hasData = true
        if (BOOL_FIELDS.has(key)) v = /^(y|yes|true|1)$/i.test(String(v ?? ''))
        else if (NUM_FIELDS.has(key)) v = v ? Number(v) : undefined
        obj[key] = v
      }
      if (hasData) rows.push(obj)
    }
    return rows
  }

  // ── Validate (preview) ───────────────────────────────────────
  validate(type: string, rows: Record<string, any>[]) {
    const cfg = this.cfg(type)
    const results = rows.map((row, idx) => {
      const errors: string[] = []
      for (const req of cfg.required) {
        if (!row[req] || String(row[req]).trim() === '') errors.push(`${req} is required`)
      }
      return { row_number: idx + 2, data: row, valid: errors.length === 0, errors }
    })
    return {
      type,
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      rows: results,
    }
  }

  // ── Commit ───────────────────────────────────────────────────
  async commit(type: string, rows: Record<string, any>[], orgId: string) {
    const cfg = this.cfg(type)
    const repo = this.ds.getRepository(cfg.entity)
    let created = 0, updated = 0, skipped = 0

    for (const row of rows) {
      // skip invalid
      const missing = cfg.required.some(r => !row[r])
      if (missing) { skipped++; continue }

      const code = row[cfg.codeField]
      let existing = code
        ? await repo.findOne({ where: { [cfg.codeField]: code, organization_id: orgId } as any })
        : null

      if (existing) {
        await repo.update({ id: (existing as any).id }, { ...row })
        updated++
      } else {
        const count = await repo.count({ where: { organization_id: orgId } as any })
        const year = new Date().getFullYear()
        const prefix = cfg.codeField.split('_')[0].toUpperCase().slice(0, 4)
        const autoCode = code || `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`
        await repo.save(repo.create({ ...row, [cfg.codeField]: autoCode, organization_id: orgId } as any))
        created++
      }
    }
    return { type, created, updated, skipped, total: rows.length }
  }
}
