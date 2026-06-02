import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('controls')
export class Control {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  @ApiProperty({ example: 'CTL-001' })
  control_id: string

  @Column({ length: 500 })
  @ApiProperty()
  name: string

  @Column({ type: 'text', nullable: true })
  objective: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'process' })
  @ApiProperty({
    enum: ['policy', 'process', 'technical', 'administrative', 'detective', 'preventive', 'corrective', 'governance']
  })
  type: string

  @Column({ default: 'ongoing' })
  @ApiProperty({ enum: ['ongoing', 'periodic', 'event_driven', 'ad_hoc'] })
  frequency: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ length: 100, nullable: true })
  related_domain_code: string

  @Column({ length: 255, nullable: true })
  related_asset_type: string

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  criticality: string

  @Column({ type: 'text', nullable: true })
  expected_evidence: string

  @Column({ type: 'text', nullable: true })
  testing_procedure: string

  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive', 'draft', 'deprecated'] })
  status: string

  @Column({ default: false })
  is_builtin: boolean

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
