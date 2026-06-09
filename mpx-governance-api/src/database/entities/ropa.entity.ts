import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('ropa_activities')
export class RopaActivity {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) ropa_code: string
  @Column({ length: 255 }) @ApiProperty() processing_activity_name: string
  @Column({ type: 'text', nullable: true }) description: string

  @Column({ type: 'uuid', nullable: true }) business_unit_id: string
  @Column({ type: 'uuid', nullable: true }) process_owner_id: string

  @Column({ length: 255, nullable: true }) data_controller: string
  @Column({ length: 255, nullable: true }) data_processor: string
  @Column({ type: 'text', nullable: true }) purpose: string
  @Column({ length: 255, nullable: true }) lawful_basis: string
  @Column({ length: 255, nullable: true }) data_subject_type: string
  @Column({ type: 'text', nullable: true }) personal_data_category: string
  @Column({ type: 'text', nullable: true }) sensitive_data_category: string

  @Column({ type: 'uuid', nullable: true }) related_application_id: string
  @Column({ type: 'uuid', nullable: true }) related_data_asset_id: string

  @Column({ length: 500, nullable: true }) recipient: string
  @Column({ default: false }) cross_border_transfer_flag: boolean
  @Column({ type: 'simple-array', nullable: true }) cross_border_country_codes: string[]
  @Column({ length: 500, nullable: true }) cross_border_safeguards: string
  @Column({ length: 100, nullable: true }) retention_period: string
  @Column({ type: 'int', nullable: true }) retention_value: number
  @Column({ length: 20, nullable: true }) retention_unit: string  // days/months/years
  @Column({ length: 500, nullable: true }) retention_criteria: string
  @Column({ length: 255, nullable: true }) deletion_method: string

  // ── Phase 2: Volume & vendors ─────────────────────────────────
  @Column({ length: 50, nullable: true }) subject_volume_range: string  // e.g. 1k-10k
  @Column({ type: 'simple-array', nullable: true }) vendor_ids: string[]

  // ── Phase 3: Data Collection ──────────────────────────────────
  @Column({ default: false }) direct_collection: boolean
  @Column({ type: 'simple-array', nullable: true }) collection_formats: string[]  // paper/electronic/web
  @Column({ default: false }) indirect_collection: boolean
  @Column({ type: 'text', nullable: true }) indirect_sources: string
  @Column({ default: false }) privacy_notice_given: boolean

  // ── Phase 3: Storage & Access ─────────────────────────────────
  @Column({ type: 'simple-array', nullable: true }) storage_formats: string[]
  @Column({ type: 'simple-array', nullable: true }) authorized_access_roles: string[]
  @Column({ default: false }) encryption_enabled: boolean
  @Column({ type: 'simple-array', nullable: true }) encryption_methods: string[]
  @Column({ default: false }) data_backup: boolean
  @Column({ length: 255, nullable: true }) backup_location: string
  @Column({ default: false }) bcdr_plan: boolean

  // ── Phase 3: Security measures ────────────────────────────────
  @Column({ type: 'text', nullable: true }) security_measure_summary: string
  @Column({ type: 'text', nullable: true }) technical_measures: string
  @Column({ type: 'text', nullable: true }) organizational_measures: string

  // ── Phase 3: DPIA ─────────────────────────────────────────────
  @Column({ default: false }) dpia_required_flag: boolean
  @Column({ length: 50, nullable: true })
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed', 'not_required'] }) dpia_status: string
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['high', 'medium', 'low'] }) dpia_level: string
  @Column({ type: 'uuid', nullable: true }) dpia_id: string

  // ── Phase 4: Risk Assessment matrix ───────────────────────────
  @Column({ type: 'jsonb', nullable: true }) risk_matrix: Record<string, unknown>
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string

  // ── Completeness tracking ─────────────────────────────────────
  @Column({ default: 1 })
  @ApiProperty({ description: 'Which ROPA phase the record has reached (1-4)' }) target_pass: number
  @Column({ default: false }) pass1_complete: boolean

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
