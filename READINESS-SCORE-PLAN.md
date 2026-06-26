# PDPA Compliance & Readiness Score — Implementation Plan (MPX-ONE)

แปลงสเปก (เขียนสำหรับ Laravel/MySQL) → **NestJS + TypeORM + PostgreSQL** ของ MPX-ONE

## Locked decisions
1. **Multi-tenant** — เพิ่ม `tenant_id` จริงในตารางใหม่ + tenant context
2. **Extend `Issue` / `ActionPlan`** เป็น gap/action (ไม่สร้าง `gap_records`/`action_items` ใหม่)
3. **ต่อยอด `BusinessUnit`** (มี `parent_id` อยู่แล้ว) + เพิ่ม `Region`/`Province` + `profile_level`
4. หน้านี้เป็น **top-menu ใหม่** ("Readiness")

---

## 1. Architecture (3 layers)

```
Source modules (มีอยู่) ──► Scoring Engine (ใหม่) ──► Snapshot tables (ใหม่) ──► Readiness API ──► Dashboard UI (ใหม่)
ROPA/Consent/DSAR/Breach/      metrics→components→         pre-calculated         /api/v1/readiness/*   top-menu page
DPIA/Vendor/Training/Evidence  4 scores + modules                                 (9 read + 3 admin)
```

หลักการ (จาก spec §17): **อย่าคำนวณสดจาก transactional tables** — ใช้ snapshot + materialized metrics, แยก score model ออกจาก UI, methodology versioned

---

## 2. Multi-tenancy

- เพิ่ม entity **`Tenant`** (id, name, slug). map `organization_id` ปัจจุบัน → tenant แรก (migration เติม default tenant)
- ตารางใหม่ทุกตัวมี `tenant_id` (indexed, อยู่ใน unique keys สำคัญ)
- **`TenantContext`** — resolve จาก Keycloak token (claim `tenant` หรือ map จาก org) ผ่าน NestJS interceptor/guard; ทุก query readiness ถูก scope ด้วย tenant
- ⚠️ หมายเหตุ: ทำ tenant isolation เต็ม app-wide เป็น track แยก (ใหญ่); เฟสนี้บังคับ tenant scope เฉพาะ readiness tables + ตั้ง pattern ให้ขยายต่อได้

---

## 3. New TypeORM entities (6) + extensions

### ใหม่ (`mpx-governance-api/src/database/entities/`)
| Entity | ตาราง | ฟิลด์หลัก |
|---|---|---|
| `ScoreMethodologyVersion` | score_methodology_versions | version_code(uniq), weight_config(jsonb), threshold_config(jsonb), is_active, effective_from/to |
| `ScoreSnapshot` | score_snapshots | assessment_period, organization_unit_id, region_id, province_code, profile_level, scope_hash, overall/compliance/control_evidence/operational_score, methodology_version_id(FK), is_latest, calculated_at |
| `ScoreComponent` | score_components | snapshot_id(FK), component_code, weight_percent, raw_score, weighted_score, status |
| `ModuleScore` | module_scores | snapshot_id(FK), module_code, module_score, status, completed/incomplete/overdue/evidence/total_count |
| `UnitScore` | unit_scores | snapshot_id(FK), organization_unit_id, readiness/compliance/control_evidence/operational_score, incomplete_records, open/overdue_actions, risk_status |
| `ScoreSourceMetric` | score_source_metrics | snapshot_id(FK), metric_code, metric_group, metric_value, source_module (audit/explainability) |

ทุกตัว: `uuid` PK, `tenant_id`, timestamps; snapshot children → `onDelete: CASCADE`

### Extend ของเดิม
- **`Issue`** (= gap): เพิ่ม `tenant_id`, `gap_severity` (มี severity แล้ว), `source_module`, `region_id`, `province_code`, `methodology_version_id`, `is_readiness_gap` flag — reuse status `open/in_progress/closed/accepted_risk`
- **`ActionPlan`** (= action): เพิ่ม `tenant_id`, `source_module`, `organization_unit_id` (มี `source_gap`/owner/due/priority/status แล้ว)
- **`BusinessUnit`**: เพิ่ม `region_id`, `province_code`, `profile_level` (basic/standard/enterprise) — มี `parent_id` (hierarchy) แล้ว
- **ใหม่**: `Region` (id, tenant_id, name, code), `Province` (code, name, region_id) — หรือ lookup-based

### Module master (16 codes)
`ropa, consent, rights_request, dpia, privacy_notice, breach, external_parties, data_map, security_controls, access_review, risk_register, data_asset, dpo_task, training, audit_log, assessment_support`

---

## 4. Scoring engine

`modules/readiness/scoring/` — service ต่อ module:
- **metric collectors** — ต่อ source module → นับ complete/incomplete/overdue/evidence (เขียนลง `score_source_metrics`)
- **component calculator** — รวม metric → 7 components (raw + weighted ตาม methodology)
- **score calculator** — 4 มิติ: Compliance Coverage, Control & Evidence, Operational Readiness, + Overall (weighted avg)
- **snapshot writer** — เขียน `score_snapshots` + children, set `is_latest`, `scope_hash` (dedupe)
- **recalculation** — `@nestjs/schedule` (nightly) + manual `POST /recalculate` (async job)

Status mapping: `85-100 excellent · 70-84 good · 50-69 fair · <50 poor`

---

## 5. Readiness API (`/api/v1/readiness/*`)

Read (Phase 1): `overview, components, modules, gaps, units, actions`
Phase 2: `trends, methodology, recalculate(POST), export(POST)`
Phase 3: `source-metrics, methodology(PUT)`

- Common query params: assessment_period, organization_unit_id, region_id, province_code, process_category, profile_level, risk_level, overdue_only, incomplete_only
- Response envelope: `{ success, data, meta:{ scope, methodology_version, calculated_at, warnings } }`
- RBAC: Executive=read summary, DPO/Admin=full, Unit Coordinator=own-unit scope only, Auditor=read-only

---

## 6. Frontend (new top-menu "Readiness")

- `lib/nav.ts`: เพิ่ม section/top-menu `readiness` → item `/readiness`
- หน้า `(shell)/readiness/page.tsx` — widgets ตามภาพ:
  1. Top filters (period/unit/region/profile) + **deep-link URL state** (searchParams)
  2. 4 hero score cards (donut + % + status + Δ vs prev)
  3. Score composition panel (7 components, weight + progress bar + tooltip)
  4. Module compliance matrix (16 cards, score + status dot, click→drill)
  5. Gap summary (critical/high/medium/low + top unresolved → link action)
  6. Org/Unit readiness table (hierarchy, sortable, drill-down)
  7. Trend chart (readiness over time) [P1 = 1 ตัว]
  8. Evidence & Actions summary (coverage %, open/overdue, next priority)
- reuse: SVG charts, KPICard, TableWrap, RiskBadge, glass-tab; status legend (green/amber/red/gray)

---

## 7. Phasing

| Phase | Backend | Frontend |
|---|---|---|
| **MVP** | 6 entities + Issue/ActionPlan/BusinessUnit extend + Tenant + scoring engine + 6 read APIs + seed methodology v1.0 | filters + 4 hero cards + composition + module matrix + gap + unit table + evidence/actions + trend×1 |
| **P2** | recalculate job, trends, methodology admin (weights), export PDF/Excel/CSV, region/province heatmap | methodology screen, heatmap, advanced trends |
| **P3** | source-metrics drill-down, benchmark, alerts/SLA, committee report pack | drill-down, benchmark, SLA dashboard |

---

## 8. Acceptance (จาก spec §16)
filter ตาม period/unit/region/profile · 4 scores ถูกต้อง · module scores · gap by severity · unit readiness · drill-down ไป source record · export · score audit ได้ · รองรับหลายหน่วยงาน/พื้นที่ · RBAC ตาม role
