import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('consents')
export class Consent {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  // PDPA Studio sync metadata (Phase 1 — one-way pull)
  @Column({ length: 100, nullable: true }) external_id: string
  @Column({ length: 50, nullable: true }) external_source: string
  @Column({ type: 'timestamptz', nullable: true }) last_synced_at: Date
  @Column({ length: 20, default: 'mpx' }) origin: string
  @Column({ type: 'jsonb', nullable: true }) external_payload: any

  @Column({ type: 'uuid' }) data_subject_id: string
  @Column({ type: 'uuid', nullable: true }) template_id: string
  @Column({ length: 20, nullable: true }) template_version: string

  @Column({ default: 'web' })
  @ApiProperty({ enum: ['web', 'mobile', 'paper', 'call_center', 'email', 'other'] })
  channel: string

  @Column({ default: false }) granted: boolean
  @Column({ length: 50, nullable: true }) ip_address: string
  @Column({ type: 'text', nullable: true }) user_agent: string
  @Column({ type: 'text', nullable: true }) proof: string

  @Column({ type: 'timestamptz', nullable: true }) granted_at: Date
  @Column({ type: 'timestamptz', nullable: true }) withdrawn_at: Date
  @Column({ type: 'timestamptz', nullable: true }) expires_at: Date
  @Column({ type: 'text', nullable: true }) withdrawal_reason: string

  // optional link to processing activity (ROPA) — nullable, no hard dependency
  @Column({ type: 'uuid', nullable: true }) related_ropa_id: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
