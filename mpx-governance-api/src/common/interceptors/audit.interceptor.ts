import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AuditTrailService } from '../../modules/audit-trail/audit-trail.service'
import { maskObject } from '../logging/pii-mask'

// Maps URL segment → audit object_type
const TYPE_MAP: Record<string, string> = {
  applications: 'application', 'data-assets': 'data_asset', ropa: 'ropa',
  vendors: 'vendor', projects: 'project', 'ai-use-cases': 'ai_use_case',
  frameworks: 'framework', obligations: 'obligation', controls: 'control',
  assessments: 'assessment', issues: 'issue', evidences: 'evidence',
  'risk-registers': 'risk', oic: 'oic_requirement',
}

const METHOD_ACTION: Record<string, string> = {
  POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete',
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditTrailService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, url, user, body, ip } = req

    return next.handle().pipe(
      tap((result) => {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return

        // Extract object type from /api/v1/<segment>/...
        const m = url.match(/\/api\/v1\/([^/?]+)/)
        const segment = m?.[1]
        const objectType = segment ? (TYPE_MAP[segment] ?? segment) : 'unknown'

        // Skip non-domain routes (auth, health, import-export preview, etc.)
        if (['health', 'auth', 'import-export', 'audit-trail', 'dashboard', 'admin'].includes(segment ?? '')) return

        let action = METHOD_ACTION[method] ?? 'update'
        // workflow actions: /:id/submit, /approve, /reject, /close, etc.
        const tail = url.split('?')[0].split('/').pop()
        if (['submit', 'approve', 'reject', 'close', 'start', 'accept'].includes(tail ?? '')) action = tail!

        const objectId = (result && typeof result === 'object' && 'id' in result)
          ? (result as any).id
          : (url.match(/\/([0-9a-f-]{36})/)?.[1] ?? 'n/a')

        this.audit.log({
          organization_id: user?.organization_id ?? 'default',
          action,
          object_type: objectType,
          object_id: objectId,
          new_value: method !== 'DELETE' ? (maskObject(body) as Record<string, unknown>) : undefined,
          user_id: user?.id,
          user_email: user?.email,
          ip_address: ip,
        }).catch(() => { /* never block request on audit failure */ })
      }),
    )
  }
}
