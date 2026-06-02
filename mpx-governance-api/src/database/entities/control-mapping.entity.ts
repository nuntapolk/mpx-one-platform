import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('control_mappings')
export class ControlMapping {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column()
  control_id: string

  @Column()
  framework_id: string

  @Column()
  obligation_id: string

  @Column({ default: 'full' })
  @ApiProperty({ enum: ['full', 'partial', 'not_applicable', 'equivalent'] })
  mapping_type: string

  @Column({ default: 'full' })
  @ApiProperty({ enum: ['full', 'partial', 'none'] })
  coverage_level: string

  @Column({ type: 'text', nullable: true })
  rationale: string

  @Column({ default: false })
  evidence_required: boolean

  @Column({ nullable: true })
  mapping_owner_id: string

  @Column({ type: 'date', nullable: true })
  review_date: Date

  @Column({ default: 'active' })
  status: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
