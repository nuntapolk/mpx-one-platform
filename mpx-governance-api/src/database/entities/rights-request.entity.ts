import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('rights_requests')
export class RightsRequest {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ type: 'uuid', nullable: true }) data_subject_id: string
  @Column({ unique: true, length: 50 }) ticket_number: string

  @Column({ default: 'access' })
  @ApiProperty({ enum: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'withdraw_consent'] })
  type: string
  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'in_review', 'awaiting_info', 'completed', 'rejected', 'withdrawn'] })
  status: string

  @Column({ length: 255, nullable: true }) requester_name: string
  @Column({ length: 255, nullable: true }) requester_email: string
  @Column({ length: 50, nullable: true }) requester_phone: string
  @Column({ length: 100, nullable: true }) requester_id_number: string

  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'text', nullable: true }) data_scope: string
  @Column({ type: 'simple-array', nullable: true }) ropa_linked_process_ids: string[]

  @Column({ type: 'uuid', nullable: true }) assigned_to: string
  @Column({ type: 'timestamptz', nullable: true }) due_date: Date
  @Column({ type: 'text', nullable: true }) response_note: string
  @Column({ type: 'text', nullable: true }) rejection_reason: string

  @Column({ type: 'timestamptz', nullable: true }) submitted_at: Date
  @Column({ type: 'timestamptz', nullable: true }) acknowledged_at: Date
  @Column({ type: 'timestamptz', nullable: true }) completed_at: Date

  // Identity verification (REQ-009)
  @Column({ type: 'timestamptz', nullable: true }) identity_verified_at: Date
  @Column({ type: 'uuid', nullable: true }) identity_verified_by: string
  // Escalation
  @Column({ type: 'timestamptz', nullable: true }) escalated_at: Date
  @Column({ type: 'text', nullable: true }) escalation_reason: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
