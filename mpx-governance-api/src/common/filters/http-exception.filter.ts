import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { AccessLogService } from '../../modules/access-log/access-log.service'
import { logger } from '../logging/logger'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly accessLog?: AccessLogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>() as any

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    // ── Security logging: authentication/authorization failures (P3) ──
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      const user = request.user
      const evt = {
        organization_id: user?.organization_id ?? null,
        category: 'authorization',
        severity: 'warn' as const,
        action: status === 401 ? 'auth_denied' : 'access_denied',
        resource_type: 'endpoint',
        endpoint: (request.originalUrl || request.url || '').split('?')[0],
        http_method: request.method,
        user_id: user?.id,
        user_email: user?.email,
        user_roles: user?.roles,
        ip_address: request.ip,
        user_agent: request.headers?.['user-agent'],
        request_id: request.requestId,
        outcome: 'denied' as const,
      }
      logger.warn({ ...evt, status }, `security: ${evt.action} ${evt.endpoint}`)
      this.accessLog?.record(evt as any).catch(() => { /* never block */ })
    } else if (status >= 500) {
      logger.error({ request_id: request.requestId, endpoint: request.url, status, err: String((exception as any)?.message) }, 'server error')
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
