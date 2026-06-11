import pino from 'pino'

// Structured JSON logger. UTC ISO-8601 timestamps, single source of truth for app logs.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ severity: label }),
  },
  base: { service: 'mpx-governance-api', env: process.env.NODE_ENV || 'development' },
  // Structured JSON to stdout — ready to ship to Loki/OpenSearch/SIEM.
})
