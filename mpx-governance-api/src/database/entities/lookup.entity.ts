import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('lookups')
@Index(['organization_id', 'category'])
export class Lookup {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 100 })
  @ApiProperty({ description: 'governance_domain | risk_category | risk_level | control_category | evidence_type | confidentiality_level | assessment_type | scoring_model | issue_type | issue_severity | workflow_status | application_criticality | project_status | vendor_type | framework_type' })
  category: string

  @Column({ length: 100 }) @ApiProperty() value: string
  @Column({ length: 255 }) @ApiProperty() label: string
  @Column({ type: 'int', default: 0 }) display_order: number
  @Column({ default: true }) is_active: boolean
  @Column({ default: false }) is_builtin: boolean

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
