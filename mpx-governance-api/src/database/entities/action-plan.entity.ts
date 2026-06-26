import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('action_plans')
export class ActionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  action_id: string  // ACT-2026-001

  @Column({ type: 'text' })
  description: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ type: 'date', nullable: true })
  due_date: Date

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  priority: string

  // Parent linkage
  @Column({ nullable: true })
  risk_id: string

  @Column({ nullable: true })
  issue_id: string

  // Readiness Score (action) additions
  @Column({ length: 100, nullable: true })
  source_module: string

  @Column({ type: 'uuid', nullable: true })
  business_unit_id: string

  @Column({ nullable: true })
  control_id: string

  @Column({ nullable: true })
  assessment_id: string

  @Column({ default: 'open' })
  @ApiProperty({ enum: ['open', 'in_progress', 'completed', 'cancelled', 'overdue'] })
  status: string

  @Column({ type: 'date', nullable: true })
  completion_date: Date

  @Column({ type: 'text', nullable: true })
  completion_note: string

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
