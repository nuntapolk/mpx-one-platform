import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('consent_templates')
export class ConsentTemplate {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ length: 120, nullable: true }) slug: string
  @Column({ default: '1.0', length: 20 }) version: string
  @Column({ type: 'text' }) @ApiProperty() purpose: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 255, nullable: true }) legal_basis: string
  @Column({ type: 'int', nullable: true }) retention_days: number
  @Column({ type: 'simple-array', nullable: true }) data_categories: string[]

  @Column({ default: false }) is_sensitive: boolean
  @Column({ default: false }) requires_explicit_consent: boolean
  @Column({ type: 'text', nullable: true }) withdrawal_info: string

  @Column({ default: 'draft' })
  @ApiProperty({ enum: ['draft', 'active', 'deprecated'] })
  status: string
  @Column({ default: true }) is_active: boolean
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
