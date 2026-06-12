import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export interface ArbFinding { type: string; severity: string; text: string }

// Architecture Review Board request (architecture governance / approval).
@Entity('arb_requests')
export class ArbRequest {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) arb_number: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'uuid', nullable: true }) application_id: string

  @Column({ length: 50, default: 'change' })
  @ApiProperty({ enum: ['new_app', 'change', 'exception', 'decommission', 'tech_selection'] }) request_type: string

  @Column({ length: 30, default: 'submitted' })
  @ApiProperty({ enum: ['submitted', 'in_review', 'approved', 'rejected', 'conditional', 'deferred'] }) status: string

  @Column({ length: 20, default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string

  @Column({ length: 255, nullable: true }) requested_by: string
  @Column({ type: 'simple-array', nullable: true }) reviewers: string[]
  @Column({ type: 'jsonb', default: () => "'[]'" }) findings: ArbFinding[]

  @Column({ type: 'text', nullable: true }) decision: string
  @Column({ type: 'text', nullable: true }) conditions: string
  @Column({ type: 'timestamptz', nullable: true }) decided_at: Date
  @Column({ type: 'date', nullable: true }) target_date: Date

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
