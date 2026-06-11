import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) application_code: string
  @Column({ length: 255 }) @ApiProperty() application_name: string
  @Column({ type: 'text', nullable: true }) description: string

  @Column({ type: 'uuid', nullable: true }) business_unit_id: string
  @Column({ type: 'uuid', nullable: true }) business_owner_id: string
  @Column({ type: 'uuid', nullable: true }) system_owner_id: string
  @Column({ type: 'uuid', nullable: true }) technical_owner_id: string

  @Column({ length: 100, nullable: true }) application_type: string
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) business_criticality: string
  @Column({ default: 'active' })
  @ApiProperty({ enum: ['planned', 'under_development', 'active', 'under_change', 'retiring', 'retired'] })
  lifecycle_status: string

  @Column({ length: 100, nullable: true }) hosting_type: string
  @Column({ length: 100, nullable: true }) environment: string
  @Column({ type: 'text', nullable: true }) technology_stack: string
  @Column({ type: 'uuid', nullable: true }) vendor_id: string

  @Column({ default: false }) personal_data_flag: boolean
  @Column({ default: false }) sensitive_data_flag: boolean
  @Column({ default: false }) ai_enabled_flag: boolean
  @Column({ default: false }) iso_scope_flag: boolean
  @Column({ default: false }) oic_scope_flag: boolean
  @Column({ default: false }) internet_facing_flag: boolean

  @Column({ type: 'text', nullable: true }) integration_summary: string
  @Column({ type: 'date', nullable: true }) go_live_date: Date
  @Column({ type: 'date', nullable: true }) retirement_date: Date

  // ── [C] Portfolio / APM (จาก MPX Studio) ──────────────────────
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['invest', 'tolerate', 'migrate', 'eliminate'], description: 'BCG / TIME classification' })
  bcg_classification: string
  @Column({ type: 'int', nullable: true }) health_score: number      // 0-100
  @Column({ type: 'int', nullable: true }) tech_debt_score: number   // 0-100 (สูง = หนี้เยอะ)
  @Column({ type: 'bigint', nullable: true }) tco_annual: number      // ต้นทุนรวมต่อปี
  @Column({ type: 'int', nullable: true }) strategic_value: number   // 0-100
  @Column({ type: 'int', nullable: true }) users_count: number

  // ── [D] Lifecycle & Assessment ────────────────────────────────
  @Column({ type: 'date', nullable: true }) eol_date: Date
  @Column({ type: 'date', nullable: true }) contract_end_date: Date
  @Column({ length: 50, nullable: true })
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed'] }) assess_status: string
  @Column({ type: 'date', nullable: true }) assess_date: Date
  @Column({ type: 'int', nullable: true }) migration_wave: number
  @Column({ default: false }) decommissioned: boolean
  @Column({ type: 'date', nullable: true }) decomm_date: Date
  @Column({ type: 'text', nullable: true }) decomm_reason: string

  // ── [E] Operations ────────────────────────────────────────────
  @Column({ default: false }) dr_enabled: boolean
  @Column({ length: 100, nullable: true }) service_hours: string
  @Column({ length: 100, nullable: true }) maint_window: string
  @Column({ length: 100, nullable: true }) support_model: string   // Inhouse / Vendor / Hybrid
  @Column({ length: 100, nullable: true }) os_platform: string
  @Column({ length: 100, nullable: true }) db_platform: string
  @Column({ length: 100, nullable: true }) language: string

  // ── [F] EA Classification ─────────────────────────────────────
  @Column({ length: 100, nullable: true }) ea_group: string
  @Column({ length: 100, nullable: true }) ea_category: string
  @Column({ length: 100, nullable: true }) ea_sub_category: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
