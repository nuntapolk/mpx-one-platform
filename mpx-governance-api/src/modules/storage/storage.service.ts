import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common'
import { Client as MinioClient } from 'minio'
import { randomUUID } from 'crypto'

// Object storage backed by MinIO / S3-compatible. Gated by env — if MINIO_ENDPOINT is
// unset the service stays disabled and endpoints return 503 (app still boots without it).
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private client: MinioClient | null = null
  private bucket = process.env.MINIO_BUCKET || 'mpx-one-storage'

  get enabled() { return this.client !== null }

  async onModuleInit() {
    const endpoint = process.env.MINIO_ENDPOINT
    if (!endpoint) {
      this.logger.warn('MINIO_ENDPOINT not set — object storage disabled')
      return
    }
    try {
      const url = new URL(endpoint.includes('://') ? endpoint : `http://${endpoint}`)
      this.client = new MinioClient({
        endPoint: url.hostname,
        port: url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : 80),
        useSSL: url.protocol === 'https:',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      })
      const exists = await this.client.bucketExists(this.bucket).catch(() => false)
      if (!exists) await this.client.makeBucket(this.bucket)
      this.logger.log(`Object storage ready — bucket "${this.bucket}" @ ${url.host}`)
    } catch (e: any) {
      this.logger.error(`Failed to init object storage: ${e.message}`)
      this.client = null
    }
  }

  private require() {
    if (!this.client) throw new ServiceUnavailableException('Object storage is not configured (MINIO_ENDPOINT)')
    return this.client
  }

  // Returns the stored object key. Keys are namespaced per org + uuid to avoid collisions.
  async upload(orgId: string, file: { originalname: string; buffer: Buffer; mimetype: string }): Promise<{ key: string; size: number }> {
    const client = this.require()
    const safeName = file.originalname.replace(/[^\w.\-]+/g, '_')
    const key = `${orgId}/${randomUUID()}-${safeName}`
    await client.putObject(this.bucket, key, file.buffer, file.buffer.length, { 'Content-Type': file.mimetype })
    return { key, size: file.buffer.length }
  }

  // Time-limited download URL (default 1h).
  presignedGet(key: string, expirySeconds = 3600): Promise<string> {
    return this.require().presignedGetObject(this.bucket, key, expirySeconds)
  }

  remove(key: string): Promise<void> {
    return this.require().removeObject(this.bucket, key)
  }
}
