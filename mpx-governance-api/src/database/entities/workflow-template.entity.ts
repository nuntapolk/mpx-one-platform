import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export interface WorkflowStep {
  step: number
  name: string
  role: string
  sla_days: number
  auto_assign?: boolean
  action?: string // approve | review | notify
}

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ default: 'ropa' })
  @ApiProperty({ enum: ['ropa', 'dpia', 'breach', 'rights', 'risk'] }) module: string

  @Column({ type: 'jsonb', default: () => "'[]'" }) steps: WorkflowStep[]
  @Column({ default: true }) is_active: boolean
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
