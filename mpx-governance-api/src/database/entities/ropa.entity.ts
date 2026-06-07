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
  @Column({ length: 100, nullable: true }) retention_period: string
  @Column({ type: 'text', nullable: true }) security_measure_summary: string
  @Column({ default: false }) dpia_required_flag: boolean
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
