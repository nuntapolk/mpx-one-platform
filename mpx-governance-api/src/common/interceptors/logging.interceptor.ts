import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { logger } from '../logging/logger'

// Structured system log for every HTTP request (category: system).
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, originalUrl, url, user, ip, requestId } = req
    const start = Date.now()

    const emit = (statusCode: number, error?: any) => {
      logger.info({
        category: 'system',
        request_id: requestId,
        method,
        endpoint: (originalUrl || url || '').split('?')[0],
        status: statusCode,
        duration_ms: Date.now() - start,
        actor: user ? { user_id: user.id, org_id: user.organization_id } : undefined,
        ip,
        ...(error ? { outcome: 'error', error: error?.message } : {}),
      }, `${method} ${url} ${statusCode}`)
    }

    return next.handle().pipe(
      tap({
        next: () => emit(context.switchToHttp().getResponse()?.statusCode ?? 200),
        error: (err) => emit(err?.status ?? 500, err),
      }),
    )
  }
}
