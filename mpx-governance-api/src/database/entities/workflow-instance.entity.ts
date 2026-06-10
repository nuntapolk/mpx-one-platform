import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export interface StepHistoryEntry {
  step: number
  actor: string
  action: string // approved | rejected | started
  notes?: string
  at: string
}

@Entity('workflow_instances')
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ type: 'uuid' }) template_id: string

  @Column({ length: 100, nullable: true }) entity_type: string  // ropa_activities, dpias, ...
  @Column({ type: 'uuid', nullable: true }) entity_id: string
  @Column({ length: 255, nullable: true }) subject: string      // human-readable label

  @Column({ type: 'int', default: 0 }) current_step: number
  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'completed', 'rejected', 'cancelled'] }) status: string

  @Column({ type: 'jsonb', default: () => "'[]'" }) step_history: StepHistoryEntry[]
  @Column({ type: 'uuid', nullable: true }) started_by: string
  @Column({ type: 'timestamptz', nullable: true }) started_at: Date
  @Column({ type: 'timestamptz', nullable: true }) completed_at: Date

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
