import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('ai_use_cases')
export class AIUseCase {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) ai_use_case_code: string
  @Column({ length: 255 }) @ApiProperty() ai_use_case_name: string
  @Column({ type: 'text', nullable: true }) description: string

  @Column({ type: 'uuid', nullable: true }) business_unit_id: string
  @Column({ type: 'uuid', nullable: true }) ai_owner_id: string
  @Column({ type: 'uuid', nullable: true }) related_application_id: string
  @Column({ type: 'uuid', nullable: true }) related_data_asset_id: string

  @Column({ length: 100, nullable: true })
  @ApiProperty({ enum: ['gen_ai', 'machine_learning', 'analytics', 'chatbot', 'recommendation', 'decision_support', 'agentic_ai', 'other'] })
  ai_type: string
  @Column({ length: 255, nullable: true }) model_provider: string
  @Column({ default: false }) external_ai_tool_flag: boolean
  @Column({ default: false }) personal_data_used_flag: boolean
  @Column({ default: false }) sensitive_data_used_flag: boolean
  @Column({ default: false }) human_oversight_required_flag: boolean

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string
  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'approved', 'rejected', 'under_review'] }) approval_status: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
