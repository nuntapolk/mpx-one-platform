import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('dpias')
export class Dpia {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) dpia_number: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 255, nullable: true }) scope: string

  // Link to processing activity (ROPA)
  @Column({ type: 'uuid', nullable: true }) ropa_record_id: string

  @Column({ default: 'screening' })
  @ApiProperty({ enum: ['screening', 'in_progress', 'under_review', 'approved', 'rejected', 'completed'] })
  status: string

  // Screening (REQ-007) — why DPIA is triggered
  @Column({ type: 'simple-array', nullable: true }) screening_criteria: string[]
  @Column({ type: 'text', nullable: true }) trigger_reason: string

  // Assessment
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string
  @Column({ type: 'int', nullable: true }) risk_score: number
  @Column({ type: 'text', nullable: true }) impact_analysis: string
  @Column({ type: 'text', nullable: true }) mitigation_plan: string
  @Column({ type: 'text', nullable: true }) findings: string
  @Column({ type: 'text', nullable: true }) recommendations: string

  // Residual + PDPC consultation
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) residual_risk_level: string
  @Column({ default: false }) consultation_required: boolean  // high residual → must consult PDPC
  @Column({ type: 'timestamptz', nullable: true }) pdpc_consulted_at: Date

  @Column({ type: 'uuid', nullable: true }) assessor_id: string
  @Column({ type: 'uuid', nullable: true }) reviewer_id: string
  @Column({ type: 'uuid', nullable: true }) approved_by: string
  @Column({ type: 'timestamptz', nullable: true }) completed_at: Date
  @Column({ type: 'timestamptz', nullable: true }) approved_at: Date
  @Column({ type: 'date', nullable: true }) next_review_date: Date
  @Column({ type: 'text', nullable: true }) rejection_reason: string

  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
