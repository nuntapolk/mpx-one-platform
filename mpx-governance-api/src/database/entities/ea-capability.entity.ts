import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Unified EA capability across all TOGAF domains (Business/Application/Data/Technology/Security).
@Entity('ea_capabilities')
@Index(['organization_id', 'domain'])
export class EaCapability {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 30 })
  @ApiProperty({ enum: ['business', 'application', 'data', 'technology', 'security'] }) domain: string

  @Column({ length: 50, nullable: true }) code: string
  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ length: 100, nullable: true }) category: string
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['L1', 'L2', 'L3'] }) level: string
  @Column({ length: 20, default: 'active' }) status: string
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['core', 'supporting', 'commodity'], description: 'strategic importance' }) tier: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
