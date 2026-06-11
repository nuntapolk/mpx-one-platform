import { Injectable, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'crypto'

// Assigns a correlation id to every request so logs can be traced across layers/services.
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const id = req.headers['x-request-id'] || randomUUID()
    req.requestId = id
    res.setHeader('X-Request-Id', id)
    next()
  }
}
