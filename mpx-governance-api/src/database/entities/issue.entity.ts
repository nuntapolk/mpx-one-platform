import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  issue_id: string  // ISS-2026-001

  @Column({ default: 'assessment_gap' })
  @ApiProperty({
    enum: ['assessment_gap', 'audit_finding', 'control_deficiency', 'policy_noncompliance',
           'risk_treatment_issue', 'evidence_missing', 'regulatory_gap']
  })
  type: string

  @Column({ length: 500 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ nullable: true })
  source_assessment_id: string

  @Column({ nullable: true })
  related_control_id: string

  @Column({ nullable: true })
  related_risk_id: string

  // Readiness Score (gap) additions — Issue doubles as a readiness gap record
  @Column({ default: false })
  is_readiness_gap: boolean

  @Column({ length: 100, nullable: true })
  source_module: string

  @Column({ type: 'uuid', nullable: true })
  region_id: string

  @Column({ length: 20, nullable: true })
  province_code: string

  @Column({ type: 'uuid', nullable: true })
  methodology_version_id: string

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  severity: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ nullable: true })
  business_unit_id: string

  @Column({ type: 'date', nullable: true })
  due_date: Date

  @Column({ type: 'text', nullable: true })
  root_cause: string

  @Column({ type: 'text', nullable: true })
  corrective_action: string

  @Column({ type: 'text', nullable: true })
  preventive_action: string

  @Column({ default: 'open' })
  @ApiProperty({ enum: ['open', 'in_progress', 'pending_review', 'resolved', 'closed', 'accepted'] })
  status: string

  @Column({ nullable: true })
  reviewer_id: string

  @Column({ type: 'text', nullable: true })
  reviewer_comment: string

  @Column({ type: 'date', nullable: true })
  closure_date: Date

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
