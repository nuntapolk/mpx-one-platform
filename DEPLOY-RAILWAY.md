# MPX-ONE — Railway Deployment Design

แผนการ deploy MPX-ONE ขึ้น Railway ตาม decisions:
**Keycloak บน Railway · ใช้ TypeORM migrations (ไม่ใช้ DB_SYNC) · รวม Redis + MinIO**

---

## 🚀 LIVE DEPLOYMENT STATUS (Railway project `mpx-one`)

Project: https://railway.com/project/83f40c71-3207-4e3e-a44d-b5cd8e24f137

| Service | สถานะ | URL |
|---|---|---|
| **mpx-web** | ✅ LIVE | https://mpx-web-production.up.railway.app |
| **mpx-api** | ✅ LIVE (internal) | `mpx-api.railway.internal:4000` |
| Postgres (แอป) | ✅ + migrations 62 tables | internal |
| Redis | ✅ | internal |
| Postgres-Xz_6 (Keycloak DB) | ✅ | internal |
| **keycloak** | ✅ LIVE + realm imported | https://keycloak-production-2b9a.up.railway.app |
| **minio** | ✅ LIVE | internal `minio.railway.internal:9000` |

**ทุก service LIVE — auth chain verified end-to-end** ✅
- Keycloak realm `mpx-one` imported (clients mpx-web/mpx-api/mpx-bff, roles, users)
- `/api/auth/login` → redirect ไป Keycloak ถูกต้อง (client mpx-bff, PKCE)
- ทดสอบ token: `admin@mpx.local` / `mpx1234` → ได้ access token สำเร็จ

### วิธีที่ใช้เลี่ยง dashboard (สำคัญ)
แทนการใช้ image service (ที่ต้องตั้ง custom start command ใน dashboard) → สร้าง **wrapper Dockerfile**:
- `keycloak/Dockerfile` — bake realm JSON + CMD `start --import-realm`
- `deploy/minio/Dockerfile` — bake CMD `server /data --console-address :9001`
- deploy ผ่าน `railway up <dir> --path-as-root --service <svc>`

### 🔑 Login (production)
URL: https://mpx-web-production.up.railway.app — user: `admin@mpx.local` / `mpx1234` (role admin)

### ⚠️ เหลือทำเอง (ไม่กระทบการทำงาน)
- **ลบ duplicate `Redis-_RK2`** ใน dashboard (CLI ลบ service ไม่ได้)
- **(แนะนำ)** เพิ่ม Volume ที่ `/data` ของ minio เพื่อให้ไฟล์ persist ข้าม restart
- **(ถ้าต้องการ)** seed ข้อมูลตัวอย่าง: `railway run --service mpx-api npm run seed:...`

---

## 1. ภาพรวม Services บน Railway

หนึ่ง **Railway Project** มีหลาย service (ใช้ private networking `*.railway.internal` ระหว่างกัน — ไม่เสีย egress):

| Service | ที่มา | Build | Public domain |
|---|---|---|---|
| `mpx-web` | `mpx-one/Dockerfile` | Docker | ✅ (HTTPS — หน้าเว็บหลัก) |
| `mpx-api` | `mpx-governance-api/Dockerfile` | Docker | ❌ internal เท่านั้น |
| `mpx-ai` | `mpx-ai-service/Dockerfile` | Docker | ❌ internal (ถ้าใช้ AI) |
| `keycloak` | image `quay.io/keycloak/keycloak:24` | image | ✅ (HTTPS — auth) |
| `postgres-app` | Railway Postgres plugin | managed | ❌ |
| `postgres-kc` | Railway Postgres plugin | managed | ❌ (DB ของ Keycloak แยก) |
| `redis` | Railway Redis plugin | managed | ❌ |
| `minio` | image `minio/minio` หรือ Railway template | image | ✅ (console) / internal (API) |

> Monitoring (Prometheus/Grafana/Loki) **ข้ามไปก่อน** — ใช้ Railway Metrics + Logs ที่มีในตัว

---

## 2. Networking & การเชื่อมต่อ

```
Browser ──HTTPS──► mpx-web (Next.js BFF)
                      │  proxy /api/proxy/*  ──internal──► mpx-api:4000
                      │  auth redirect       ──HTTPS────► keycloak (public)
                   mpx-api ──internal──► postgres-app, redis, minio, mpx-ai
                   keycloak ──internal──► postgres-kc
```

- Frontend คุยกับ API ผ่าน env **`API_INTERNAL_URL=http://mpx-api.railway.internal:4000`** (BFF proxy ที่ `mpx-one/src/app/api/proxy/[...path]/route.ts`)
- Browser คุยกับ Keycloak โดยตรง (redirect) จึงต้องใช้ **public URL ของ keycloak**

---

## 3. Environment Variables (ต่อ service)

### `mpx-api`
| Key | Value (ตัวอย่าง) |
|---|---|
| `DATABASE_URL` | `${{Postgres-App.DATABASE_URL}}` (reference variable) |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DB_SYNC` | `false` ⚠️ (ใช้ migrations แทน) |
| `AUTH_ENABLED` | `true` |
| `KEYCLOAK_URL` | `https://<keycloak-public-domain>` |
| `KEYCLOAK_REALM` | `mpx-one` |
| `KEYCLOAK_CLIENT_ID` | `mpx-api` |
| `FRONTEND_URL` | `https://<mpx-web-public-domain>` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` ✅ wired |
| `MINIO_ENDPOINT` | `http://minio.railway.internal:9000` ✅ wired |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | จาก MinIO service |
| `MINIO_BUCKET` | `mpx-one-storage` (auto-create) |
| `LOG_LEVEL` | `info` |
| `RETENTION_*` | ตามค่าเดิมใน `.env.example` |

### `mpx-web`
| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `API_INTERNAL_URL` | `http://mpx-api.railway.internal:4000` |
| `NEXT_PUBLIC_API_URL` | `/api/proxy` |
| `AUTH_ENABLED` | `true` |
| `KEYCLOAK_URL` | `https://<keycloak-public-domain>` |
| `KEYCLOAK_REALM` / `KEYCLOAK_CLIENT_ID` | `mpx-one` / `mpx-web` |

### `keycloak`
| Key | Value |
|---|---|
| `KC_DB` | `postgres` |
| `KC_DB_URL` | `${{Postgres-KC.DATABASE_URL}}` (แปลงเป็น jdbc) |
| `KC_HOSTNAME` | `<keycloak-public-domain>` |
| `KC_PROXY` | `edge` (อยู่หลัง Railway TLS proxy) |
| `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` | admin seed |
| start command | `start --import-realm` (mount realm json) |

---

## 4. งานที่ต้องทำก่อน deploy (gap จากโค้ดปัจจุบัน)

### ✅ A. Migrations — **เสร็จแล้ว** (B1047+)
- Generate baseline migration ครบ **62 tables** (รวม `app_content`, `ai_assessments`): `src/database/migrations/1782222863718-Init.ts`
- `data-source.ts` ปรับให้ resolve path อัตโนมัติ — `src/*.ts` ตอน dev, `dist/*.js` ตอน production (image ไม่มี ts-node)
- เพิ่ม npm scripts: `migration:run:prod` (typeorm CLI ชี้ `dist/config/data-source.js`) + `start:migrate` (run migration แล้วค่อย start)
- **Dockerfile** `mpx-api` เปลี่ยน CMD → `npm run start:migrate` → รัน migration อัตโนมัติทุกครั้งที่ deploy (idempotent — ทดสอบแล้ว re-run = "No migrations are pending")
- บน Railway: ตั้ง **`DB_SYNC=false`** เท่านั้นพอ ที่เหลือ container จัดการเอง
- ทดสอบครบ: empty DB → `migration:run:prod` → 62 tables สำเร็จ, re-run ไม่พัง

### ✅ B. Redis wiring — **เสร็จแล้ว**
- เพิ่ม global `CacheModule.registerAsync` ใน `app.module.ts` (ใช้ `@nestjs/cache-manager` + `cache-manager-redis-store`)
- ตั้ง **`REDIS_URL`** → ใช้ Redis; ไม่ตั้ง → fallback เป็น in-memory cache (แอป boot ได้เสมอ)
- ทดสอบแล้ว: boot โดยไม่มี `REDIS_URL` → ไม่ crash

### ✅ C. MinIO wiring — **เสร็จแล้ว**
- เพิ่ม `StorageModule` (global) + `StorageService` ใช้ SDK `minio` — auto-create bucket ตอน start
- Endpoints (guarded): `POST /api/v1/storage/upload` (multipart), `GET /api/v1/storage/presign?key=`, `DELETE /api/v1/storage/:key`, `GET /api/v1/storage/status`
- Gated ด้วย **`MINIO_ENDPOINT`** — ไม่ตั้ง → object storage disabled (endpoints คืน 503, แอป boot ปกติ)
- โมดูลอื่น (evidences/import-export) inject `StorageService` ไปใช้เก็บ key ในฟิลด์เดิมได้
- ทดสอบแล้ว: boot โดยไม่มี `MINIO_ENDPOINT` → log "object storage disabled" + start สำเร็จ

### 🟢 D. Health checks
`mpx-api` มี `GET /health` แล้ว → ตั้งเป็น Railway healthcheck path. `mpx-web` ใช้ `/` หรือเพิ่ม `/api/health`

### 🟢 E. Dockerfile review
ทั้ง 3 service มี Dockerfile แล้ว — ตรวจว่า:
- expose PORT ตรง และอ่านจาก `process.env.PORT` (Railway inject PORT)
- multi-stage build (deps → build → runtime) เพื่อ image เล็ก

---

## 5. ลำดับการ deploy

1. สร้าง Railway project + provision **Postgres-App, Postgres-KC, Redis**
2. Deploy **Keycloak** (image + Postgres-KC) → ตั้ง realm `mpx-one` + clients `mpx-web` (public/PKCE) + `mpx-api` (bearer) → ได้ public domain
3. Generate + commit **migrations** (งาน A)
4. Deploy **mpx-api** (Dockerfile) → ตั้ง env + release command `migration:run` → healthcheck `/health`
5. Deploy **mpx-web** (Dockerfile) → ตั้ง `API_INTERNAL_URL` ไป mpx-api internal → ได้ public domain
6. อัปเดต `FRONTEND_URL` ใน mpx-api + `redirectUris` ใน Keycloak client ให้ตรง public domain ของ web
7. (ถ้าทำ B/C) provision MinIO + wire Redis/S3 แล้ว redeploy api
8. รัน seed scripts ที่จำเป็นครั้งเดียว (ผ่าน Railway `railway run npm run seed:...`)

---

## 6. ความเสี่ยง / ข้อควรระวัง

- **อย่าเปิด `DB_SYNC=true` บน production** — เสี่ยง data loss เมื่อ entity เปลี่ยน
- Keycloak ต้องตั้ง `KC_PROXY=edge` + `KC_HOSTNAME` ให้ตรง ไม่งั้น redirect loop
- Cookie auth ใช้ `secure:true` ใน production → ต้องเป็น HTTPS ทั้งหมด (Railday ให้อยู่แล้ว)
- ค่า egress: ใช้ `.railway.internal` ระหว่าง service เสมอ
- Seed data ปัจจุบัน (ROPA 150 ฯลฯ) อยู่ใน local DB — ต้อง migrate/seed ใหม่บน Railway DB
