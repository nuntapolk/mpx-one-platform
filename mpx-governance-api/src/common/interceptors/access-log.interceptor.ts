import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AccessLogService } from '../../modules/access-log/access-log.service'

// URL segment → { resource_type, pii_categories } for personal-data-bearing endpoints.
const PII_RESOURCES: Record<string, { type: string; pii: string[] }> = {
  'dsar': { type: 'rights_request', pii: ['name', 'email', 'phone', 'national_id'] },
  'consent': { type: 'consent', pii: ['name', 'email'] },
  'data-subjects': { type: 'data_subject', pii: ['name', 'email', 'phone', 'national_id'] },
  'breach': { type: 'breach_incident', pii: ['affected_data'] },
  'training': { type: 'training_completion', pii: ['name', 'email'] },
  'external-parties': { type: 'external_party', pii: ['contact'] },
  'cookie': { type: 'cookie_consent', pii: ['ip', 'device'] },
  'ropa': { type: 'ropa_activity', pii: ['inventory'] },
  'privacy': { type: 'privacy_notice', pii: ['retention'] },
}

const SENSITIVE = ['national_id', 'health', 'biometric', 'criminal']

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private accessLog: AccessLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, originalUrl, url, user, ip, requestId, headers } = req
    const path = (originalUrl || url || '').split('?')[0]

    // Only GET (read/search/export). Writes are covered by AuditInterceptor.
    if (method !== 'GET') return next.handle()

    const m = path.match(/\/api\/v1\/([^/]+)/)
    const segment = m?.[1]
    if (!segment) return next.handle()

    const isExport = /export|download/.test(path)
    const meta = PII_RESOURCES[segment]
    if (!meta && !isExport) return next.handle()  // not a PII-bearing read

    return next.handle().pipe(
      tap((result) => {
        const idMatch = path.match(/\/([0-9a-f-]{36})(?:\/|$)/)
        const resourceId = idMatch?.[1]
        const action = isExport ? 'export' : resourceId ? 'read' : 'search'
        const recordCount = Array.isArray(result) ? result.length : undefined
        const pii = meta?.pii ?? ['mixed']

        this.accessLog.record({
          organization_id: user?.organization_id ?? 'default',
          category: isExport ? 'export' : 'pii_access',
          severity: isExport ? 'warn' : pii.some((c) => SENSITIVE.includes(c)) ? 'warn' : 'info',
          action,
          resource_type: meta?.type ?? segment,
          resource_id: resourceId,
          pii_categories: pii,
          record_count: recordCount,
          user_id: user?.id,
          user_email: user?.email,
          user_roles: user?.roles,
          ip_address: ip,
          user_agent: headers?.['user-agent'],
          request_id: requestId,
          http_method: method,
          endpoint: path,
          outcome: 'success',
        }).catch(() => { /* never block on logging */ })
      }),
    )
  }
}
