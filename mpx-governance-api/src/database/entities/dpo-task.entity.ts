import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('dpo_tasks')
export class DpoTask {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 100, nullable: true })
  @ApiProperty({ enum: ['dsar', 'breach', 'audit', 'training', 'review', 'consultation', 'policy', 'other'] })
  category: string
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) priority: string
  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'] }) status: string

  @Column({ type: 'date', nullable: true }) due_date: Date
  @Column({ type: 'uuid', nullable: true }) assigned_to: string
  @Column({ type: 'text', nullable: true }) notes: string
  @Column({ type: 'timestamptz', nullable: true }) completed_at: Date
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
