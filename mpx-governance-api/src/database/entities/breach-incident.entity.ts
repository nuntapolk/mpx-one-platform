import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('breach_incidents')
export class BreachIncident {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) incident_number: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string

  @Column({ default: 'confidentiality' })
  @ApiProperty({ enum: ['confidentiality', 'integrity', 'availability', 'mixed'] })
  breach_type: string
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  severity: string
  @Column({ default: 'reported' })
  @ApiProperty({ enum: ['reported', 'investigating', 'contained', 'notified', 'resolved', 'closed'] })
  status: string

  @Column({ type: 'timestamptz', nullable: true }) discovered_at: Date
  @Column({ type: 'timestamptz', nullable: true }) occurred_at: Date

  @Column({ type: 'int', nullable: true }) affected_count: number
  @Column({ type: 'simple-array', nullable: true }) data_types_affected: string[]
  @Column({ default: false }) includes_sensitive_data: boolean
  @Column({ type: 'text', nullable: true }) impact_assessment: string

  // PDPC notification (72-hour rule)
  @Column({ default: false }) requires_pdpc_notification: boolean
  @Column({ type: 'timestamptz', nullable: true }) pdpc_notification_deadline: Date
  @Column({ type: 'timestamptz', nullable: true }) pdpc_notified_at: Date
  @Column({ length: 100, nullable: true }) pdpc_reference_number: string
  @Column({ default: false }) requires_subject_notification: boolean
  @Column({ type: 'timestamptz', nullable: true }) subjects_notified_at: Date

  @Column({ type: 'text', nullable: true }) containment_actions: string
  @Column({ type: 'text', nullable: true }) root_cause: string
  @Column({ type: 'text', nullable: true }) corrective_actions: string
  @Column({ type: 'text', nullable: true }) preventive_measures: string
  @Column({ type: 'text', nullable: true }) lessons_learned: string

  @Column({ type: 'uuid', nullable: true }) reported_by: string
  @Column({ type: 'uuid', nullable: true }) assigned_to: string
  @Column({ type: 'timestamptz', nullable: true }) resolved_at: Date

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
