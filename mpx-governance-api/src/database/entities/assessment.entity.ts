import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  assessment_number: string  // ASM-2026-001

  @Column()
  template_id: string

  @Column({ length: 255 })
  title: string

  @Column({ length: 255, nullable: true })
  scope: string

  @Column({ type: 'date', nullable: true })
  period_start: Date

  @Column({ type: 'date', nullable: true })
  period_end: Date

  @Column({ nullable: true })
  assigned_owner_id: string

  @Column({ nullable: true })
  reviewer_id: string

  @Column({ nullable: true })
  approver_id: string

  @Column({ type: 'date', nullable: true })
  due_date: Date

  @Column({ default: 'draft' })
  @ApiProperty({
    enum: ['draft', 'assigned', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'closed']
  })
  status: string

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number

  @Column({ length: 100, nullable: true })
  result: string  // pass, fail, partial, satisfactory

  @Column({ type: 'text', nullable: true })
  reviewer_comment: string

  @Column({ nullable: true })
  submitted_at: Date
  @Column({ nullable: true })
  approved_at: Date
  @Column({ nullable: true })
  closed_at: Date

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
