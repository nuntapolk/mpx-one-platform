import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('external_parties')
export class ExternalParty {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) code: string
  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ length: 255, nullable: true }) name_en: string
  @Column({ length: 100, nullable: true })
  @ApiProperty({ enum: ['processor', 'controller', 'joint_controller', 'sub_processor', 'recipient'] })
  type: string
  @Column({ length: 50, nullable: true }) tax_id: string
  @Column({ length: 100, nullable: true }) country: string
  @Column({ length: 100, nullable: true }) industry: string
  @Column({ length: 100, nullable: true }) relationship_type: string

  @Column({ type: 'text', nullable: true }) services_description: string
  @Column({ type: 'simple-array', nullable: true }) data_types_shared: string[]
  @Column({ type: 'text', nullable: true }) processing_purposes: string
  @Column({ type: 'text', nullable: true }) systems_involved: string

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string
  @Column({ type: 'text', nullable: true }) risk_notes: string
  @Column({ default: false }) is_cross_border: boolean
  @Column({ length: 255, nullable: true }) transfer_mechanism: string
  @Column({ type: 'text', nullable: true }) transfer_countries: string
  @Column({ default: false }) tia_required: boolean
  @Column({ type: 'timestamptz', nullable: true }) tia_completed_at: Date

  @Column({ length: 255, nullable: true }) contact_name: string
  @Column({ length: 255, nullable: true }) contact_email: string
  @Column({ length: 50, nullable: true }) contact_phone: string
  @Column({ length: 255, nullable: true }) dpo_email: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'int', nullable: true }) review_frequency_months: number
  @Column({ type: 'date', nullable: true }) next_review_date: Date
  @Column({ type: 'text', nullable: true }) notes: string
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
