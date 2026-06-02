import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('frameworks')
export class Framework {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  @ApiProperty({ example: 'PDPA-TH' })
  framework_id: string

  @Column({ length: 255 })
  @ApiProperty({ example: 'Thailand PDPA' })
  name: string

  @Column({ default: 'regulation' })
  @ApiProperty({ enum: ['regulation', 'standard', 'framework', 'guideline', 'internal_policy'] })
  type: string

  @Column({ length: 255, nullable: true })
  regulator: string

  @Column({ length: 50, nullable: true })
  version: string

  @Column({ type: 'date', nullable: true })
  effective_date: Date

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive', 'draft', 'superseded'] })
  status: string

  @Column({ length: 500, nullable: true })
  document_reference: string

  @Column({ length: 100, nullable: true })
  related_domain_code: string  // PDPA, IT_RISK, etc.

  @Column({ default: false })
  is_builtin: boolean  // seed data จาก system

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
