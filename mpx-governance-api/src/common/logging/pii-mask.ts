// PII masking utilities — never persist raw sensitive data into logs.
// Compliance: PDPA security measures, OWASP ASVS V7 (no sensitive data in logs).

import * as crypto from 'crypto'

// Keys whose values must be fully redacted wherever they appear.
const REDACT_KEYS = new Set([
  'password', 'pass', 'pwd', 'secret', 'token', 'access_token', 'refresh_token',
  'authorization', 'api_key', 'apikey', 'client_secret', 'otp', 'pin',
])

// Keys that hold PII to be partially masked (show only a tail/hint).
const PII_KEYS = new Set([
  'national_id', 'nationalid', 'id_number', 'requester_id_number', 'tax_id', 'taxid',
  'email', 'requester_email', 'contact_email', 'dpo_email',
  'phone', 'requester_phone', 'contact_phone', 'tel',
  'bank_account', 'account_number', 'card_number', 'passport',
])

export function maskEmail(v: string): string {
  const [u, d] = String(v).split('@')
  if (!d) return maskTail(v, 2)
  const head = u.length <= 2 ? u[0] ?? '' : u.slice(0, 2)
  return `${head}${'*'.repeat(Math.max(1, u.length - 2))}@${d}`
}

// Keep only the last `keep` characters visible.
export function maskTail(v: string, keep = 4): string {
  const s = String(v)
  if (s.length <= keep) return '*'.repeat(s.length)
  return `${'*'.repeat(s.length - keep)}${s.slice(-keep)}`
}

// Deterministic, non-reversible reference (for correlating without exposing the value).
export function hashRef(v: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(String(v)).digest('hex').slice(0, 16)
}

function maskValue(key: string, value: unknown): unknown {
  const k = key.toLowerCase()
  if (REDACT_KEYS.has(k)) return '[REDACTED]'
  if (PII_KEYS.has(k) && typeof value === 'string') {
    return k.includes('email') ? maskEmail(value) : maskTail(value, 4)
  }
  return value
}

// Recursively mask an object graph for safe logging.
export function maskObject(input: unknown, depth = 0): unknown {
  if (input == null || depth > 6) return input
  if (Array.isArray(input)) return input.map((v) => maskObject(v, depth + 1))
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = typeof v === 'object' && v !== null ? maskObject(v, depth + 1) : maskValue(k, v)
    }
    return out
  }
  return input
}
