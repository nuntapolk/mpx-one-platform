import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) project_code: string
  @Column({ length: 255 }) @ApiProperty() project_name: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 100, nullable: true }) project_type: string

  @Column({ type: 'uuid', nullable: true }) business_sponsor_id: string
  @Column({ type: 'uuid', nullable: true }) project_manager_id: string
  @Column({ type: 'uuid', nullable: true }) related_application_id: string
  @Column({ type: 'uuid', nullable: true }) related_vendor_id: string
  @Column({ type: 'uuid', nullable: true }) related_data_asset_id: string

  @Column({ default: false }) pdpa_impact_flag: boolean
  @Column({ default: false }) it_risk_impact_flag: boolean
  @Column({ default: false }) ai_impact_flag: boolean
  @Column({ default: false }) security_review_required_flag: boolean
  @Column({ default: false }) architecture_review_required_flag: boolean

  @Column({ type: 'date', nullable: true }) planned_go_live_date: Date
  @Column({ default: 'proposed' })
  @ApiProperty({ enum: ['proposed', 'approved', 'in_progress', 'on_hold', 'go_live_pending', 'completed', 'cancelled'] })
  project_status: string
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
