import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('data_processing_agreements')
export class DataProcessingAgreement {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ type: 'uuid', nullable: true }) external_party_id: string

  @Column({ unique: true, length: 50 }) dpa_number: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ length: 100, nullable: true }) type: string
  @Column({ length: 100, nullable: true }) our_role: string
  @Column({ length: 100, nullable: true }) their_role: string
  @Column({ length: 255, nullable: true }) signatory_our: string
  @Column({ length: 255, nullable: true }) signatory_their: string

  @Column({ default: 'draft' })
  @ApiProperty({ enum: ['draft', 'pending_signature', 'active', 'expired', 'terminated'] }) status: string
  @Column({ type: 'timestamptz', nullable: true }) signed_at: Date
  @Column({ type: 'timestamptz', nullable: true }) effective_at: Date
  @Column({ type: 'timestamptz', nullable: true }) expires_at: Date
  @Column({ default: false }) auto_renew: boolean
  @Column({ type: 'int', nullable: true }) termination_notice_days: number

  @Column({ type: 'simple-array', nullable: true }) data_categories: string[]
  @Column({ type: 'simple-array', nullable: true }) processing_purposes: string[]
  @Column({ default: false }) sub_processors_allowed: boolean
  @Column({ type: 'text', nullable: true }) security_requirements: string
  @Column({ default: false }) audit_rights: boolean
  @Column({ type: 'int', nullable: true }) breach_notification_hours: number

  @Column({ length: 500, nullable: true }) file_path: string
  @Column({ length: 20, default: '1.0' }) version: string
  @Column({ type: 'text', nullable: true }) notes: string
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
