import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('obligations')
export class Obligation {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column()
  framework_id: string

  @Column({ unique: true, length: 100 })
  @ApiProperty({ example: 'PDPA-37-1' })
  obligation_id: string

  @Column({ length: 255 })
  @ApiProperty()
  clause: string  // e.g. "มาตรา 37(1)"

  @Column({ length: 500 })
  @ApiProperty()
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'requirement' })
  @ApiProperty({ enum: ['requirement', 'prohibition', 'permission', 'definition', 'obligation'] })
  type: string

  @Column({ default: 'mandatory' })
  @ApiProperty({ enum: ['mandatory', 'recommended', 'optional'] })
  applicability: string

  @Column({ length: 100, nullable: true })
  related_domain_code: string

  @Column({ default: false })
  risk_relevance: boolean

  @Column({ type: 'text', nullable: true })
  evidence_expected: string

  @Column({ default: 'active' })
  status: string

  @Column({ default: false })
  is_builtin: boolean

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
