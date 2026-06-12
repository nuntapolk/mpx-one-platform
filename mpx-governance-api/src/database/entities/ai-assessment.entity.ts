import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export interface AiStepState { no: number; status: string; notes?: string; evidence?: string; completed_at?: string }

// AI Risk Assessment — 21-step Sequential End-to-End AI Governance Workflow
@Entity('ai_assessments')
export class AiAssessment {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) assessment_code: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'uuid', nullable: true }) ai_use_case_id: string

  @Column({ length: 255, nullable: true }) requester: string
  @Column({ length: 255, nullable: true }) business_owner: string

  @Column({ type: 'int', default: 1 }) current_step: number   // 1-21
  @Column({ length: 30, default: 'intake' })
  @ApiProperty({ enum: ['intake', 'risk', 'approval', 'implementation', 'operations', 'closed'] }) phase: string
  @Column({ length: 30, default: 'in_progress' })
  @ApiProperty({ enum: ['in_progress', 'approved', 'conditional', 'rejected', 'live', 'retired'] }) status: string

  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['low', 'medium', 'high'] }) risk_tier: string

  // 6 risk-domain scores (0-100; lower = safer)
  @Column({ type: 'jsonb', default: () => "'{}'" }) scores: Record<string, number>
  @Column({ type: 'int', nullable: true }) consolidated_score: number

  @Column({ type: 'simple-array', nullable: true }) regulatory: string[]   // BOT / OIC / PDPA

  // Approval (Step 13)
  @Column({ type: 'text', nullable: true }) decision: string
  @Column({ type: 'text', nullable: true }) conditions: string
  @Column({ type: 'timestamptz', nullable: true }) decided_at: Date

  // Implementation (Steps 14-17)
  @Column({ type: 'jsonb', default: () => "'[]'" }) guardrails: { key: string; label: string; enabled: boolean }[]
  @Column({ type: 'text', nullable: true }) airp: string   // AI Incident Response Plan (kill switch/fallback)

  // Operations (Steps 18-21)
  @Column({ type: 'text', nullable: true }) monitoring_notes: string
  @Column({ type: 'date', nullable: true }) eol_date: Date

  // 21-step progress
  @Column({ type: 'jsonb', default: () => "'[]'" }) steps: AiStepState[]

  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
