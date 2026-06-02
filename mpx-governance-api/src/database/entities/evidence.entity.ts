import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  evidence_id: string  // EVD-2026-001

  @Column({ length: 500 })
  name: string

  @Column({ default: 'document' })
  @ApiProperty({
    enum: ['policy', 'procedure', 'standard', 'guideline', 'report', 'screenshot',
           'approval_record', 'meeting_minutes', 'system_log', 'configuration',
           'contract', 'assessment_result', 'other']
  })
  type: string

  @Column({ type: 'text', nullable: true })
  description: string

  // Storage reference
  @Column({ length: 1000, nullable: true })
  file_path: string  // MinIO path

  @Column({ length: 1000, nullable: true })
  external_link: string

  @Column({ type: 'text', nullable: true })
  text_reference: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ default: '1.0', length: 20 })
  version: string

  @Column({ type: 'date', nullable: true })
  effective_date: Date

  @Column({ type: 'date', nullable: true })
  expiry_date: Date

  @Column({ type: 'date', nullable: true })
  review_date: Date

  @Column({ default: 'internal' })
  @ApiProperty({ enum: ['public', 'internal', 'confidential', 'restricted'] })
  confidentiality_level: string

  @Column({ default: 'draft' })
  @ApiProperty({ enum: ['draft', 'submitted', 'accepted', 'rejected', 'expired', 'archived'] })
  status: string

  @Column({ nullable: true })
  reviewer_id: string

  @Column({ type: 'text', nullable: true })
  reviewer_comment: string

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
