import * as crypto from 'crypto'

// Tamper-evidence: each log record stores hash = sha256(prev_hash + canonical(payload)).
// A broken link proves insertion/deletion/modification. (ISO 27001 A.8.15 log protection)
export const GENESIS = '0'.repeat(64)

// Deterministic serialization (stable key order) of the fields that must be protected.
export function canonical(fields: Record<string, unknown>): string {
  const keys = Object.keys(fields).sort()
  return keys.map((k) => `${k}=${stringify(fields[k])}`).join('|')
}

function stringify(v: unknown): string {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export function chainHash(prevHash: string, fields: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(`${prevHash || GENESIS}|${canonical(fields)}`).digest('hex')
}
