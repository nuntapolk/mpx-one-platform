import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Immutable record of access to personal data (read / search / export).
// Compliance: PDPA ม.37(1) access logging, ISO 27701, OWASP ASVS V7.
@Entity('access_logs')
@Index(['organization_id', 'created_at'])
@Index(['resource_type', 'resource_id'])
export class AccessLog {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 30, default: 'pii_access' })
  @ApiProperty({ enum: ['pii_access', 'export'] }) category: string
  @Column({ length: 20, default: 'info' })
  @ApiProperty({ enum: ['info', 'warn', 'critical'] }) severity: string

  @Column({ length: 30 })
  @ApiProperty({ enum: ['read', 'search', 'export', 'download'] }) action: string

  @Column({ length: 100 }) resource_type: string
  @Column({ length: 100, nullable: true }) resource_id: string
  @Column({ type: 'simple-array', nullable: true }) pii_categories: string[]
  @Column({ type: 'int', nullable: true }) record_count: number

  // Actor (WHO) — string (Keycloak sub or 'dev-user'), not enforced uuid
  @Column({ length: 100, nullable: true }) user_id: string
  @Column({ length: 255, nullable: true }) user_email: string
  @Column({ type: 'simple-array', nullable: true }) user_roles: string[]

  // Context (WHERE / HOW)
  @Column({ length: 64, nullable: true }) ip_address: string
  @Column({ type: 'text', nullable: true }) user_agent: string
  @Column({ length: 64, nullable: true }) request_id: string
  @Column({ length: 10, nullable: true }) http_method: string
  @Column({ length: 255, nullable: true }) endpoint: string

  @Column({ length: 20, default: 'success' })
  @ApiProperty({ enum: ['success', 'denied', 'error'] }) outcome: string
  @Column({ length: 50, nullable: true }) legal_basis: string

  @CreateDateColumn() created_at: Date
}
