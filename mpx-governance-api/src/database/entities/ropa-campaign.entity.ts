import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('ropa_campaigns')
export class RopaCampaign {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 100, unique: true }) campaign_token: string
  @Column({ default: 'collect' })
  @ApiProperty({ enum: ['collect', 'review', 'update'] }) mode: string
  @Column({ type: 'date', nullable: true }) deadline: Date
  @Column({ default: false }) allow_multiple: boolean
  @Column({ default: false }) require_employee_id: boolean
  @Column({ default: 'draft' })
  @ApiProperty({ enum: ['draft', 'active', 'closed'] }) status: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
