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

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
