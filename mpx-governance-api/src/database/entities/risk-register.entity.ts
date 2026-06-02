import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('risk_registers')
export class RiskRegister {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 500 })
  @ApiProperty()
  risk_name: string

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  level: string

  @Column({ length: 10, default: 'L2' })
  @ApiProperty({ example: 'L3' })
  likelihood: string

  @Column({ length: 10, default: 'I3' })
  @ApiProperty({ example: 'I4' })
  impact: string

  @Column({ length: 255 })
  @ApiProperty()
  owner: string

  @Column({ default: 'mitigate' })
  @ApiProperty({ enum: ['mitigate', 'transfer', 'accept', 'avoid'] })
  treatment: string

  @Column({ default: 'open' })
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved', 'accepted'] })
  status: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
