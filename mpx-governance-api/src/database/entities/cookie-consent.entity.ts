import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('cookie_consents')
export class CookieConsent {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ type: 'uuid', nullable: true }) banner_setting_id: string

  @Column({ length: 100, nullable: true }) visitor_id: string
  @Column({ length: 100, nullable: true }) session_id: string
  @Column({ default: 'accept_all' })
  @ApiProperty({ enum: ['accept_all', 'reject_all', 'custom'] }) action: string
  @Column({ type: 'simple-array', nullable: true }) accepted_categories: string[]
  @Column({ type: 'simple-array', nullable: true }) rejected_categories: string[]
  @Column({ length: 20, nullable: true }) consent_version: string
  @Column({ length: 50, default: 'web' }) channel: string
  @Column({ length: 50, nullable: true }) ip_address: string
  @Column({ length: 255, nullable: true }) user_agent_hash: string
  @Column({ length: 500, nullable: true }) page_url: string
  @Column({ type: 'text', nullable: true }) consent_text_snapshot: string
  @Column({ type: 'timestamptz', nullable: true }) consented_at: Date
  @Column({ type: 'timestamptz', nullable: true }) expires_at: Date
  @Column({ type: 'timestamptz', nullable: true }) withdrawn_at: Date

  @CreateDateColumn() created_at: Date
}
