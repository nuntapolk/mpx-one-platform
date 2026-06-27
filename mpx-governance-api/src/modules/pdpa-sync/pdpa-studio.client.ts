import { Injectable, Logger } from '@nestjs/common'

// Thin typed client over PDPA Studio REST API v1 (one-way pull).
// Configured via env; disabled (enabled=false) when no API key is set.
@Injectable()
export class PdpaStudioClient {
  private readonly logger = new Logger(PdpaStudioClient.name)
  private readonly base = (process.env.PDPA_STUDIO_URL || 'https://pdpastudio-production.up.railway.app/api/v1').replace(/\/$/, '')
  private readonly apiKey = process.env.PDPA_STUDIO_API_KEY || ''

  get enabled() { return !!this.apiKey }
  get baseUrl() { return this.base }

  private async get<T = any>(path: string): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      headers: { 'X-Api-Key': this.apiKey, Accept: 'application/json' },
      // @ts-ignore - Node fetch supports signal/timeout via AbortController
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`PDPA Studio GET ${path} -> ${res.status}`)
    return res.json() as Promise<T>
  }

  // Many list endpoints may wrap data as {data:[...]} or return a raw array — normalize.
  private list(payload: any): any[] {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.results)) return payload.results
    return []
  }

  async ropa(): Promise<any[]> { return this.list(await this.get('/ropa')) }
  async rightsRequests(): Promise<any[]> { return this.list(await this.get('/rights/requests')) }
  async subjects(): Promise<any[]> { return this.list(await this.get('/subjects')) }
  async consentsBySubject(email: string): Promise<any[]> {
    return this.list(await this.get(`/consents/subject/${encodeURIComponent(email)}`))
  }
  async health(): Promise<any> { return this.get('/health') }
}
