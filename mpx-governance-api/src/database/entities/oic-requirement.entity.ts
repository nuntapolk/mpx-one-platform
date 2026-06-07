import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('oic_requirements')
export class OicRequirement {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) requirement_code: string
  @Column({ length: 100 })
  @ApiProperty({ enum: ['IT Governance', 'IT Risk Management', 'IT Security', 'IT Outsourcing', 'Project Management', 'IT Audit', 'Business Continuity / DR', 'Access Control', 'Incident Management', 'Change Management'] })
  oic_area: string
  @Column({ length: 500 }) @ApiProperty() requirement_title: string
  @Column({ type: 'text', nullable: true }) requirement_description: string
  @Column({ type: 'text', nullable: true }) expected_control: string
  @Column({ type: 'text', nullable: true }) expected_evidence: string
  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) criticality: string

  // Linkage (set when control/evidence mapped)
  @Column({ type: 'uuid', nullable: true }) mapped_control_id: string
  @Column({ type: 'uuid', nullable: true }) linked_evidence_id: string

  @Column({ default: false }) is_builtin: boolean
  @Column({ default: 'active' }) status: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
