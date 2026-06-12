import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Coverage mapping: which application supports which EA capability, and how well.
@Entity('ea_capability_maps')
@Index(['organization_id', 'capability_id'])
@Index(['organization_id', 'application_id'])
export class EaCapabilityMap {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ type: 'uuid' }) capability_id: string
  @Column({ type: 'uuid' }) application_id: string

  @Column({ length: 20, default: 'partial' })
  @ApiProperty({ enum: ['full', 'partial', 'planned', 'gap'] }) coverage_level: string
  @Column({ length: 50, nullable: true }) role: string  // primary / secondary / source / consumer
  @Column({ type: 'text', nullable: true }) notes: string

  @CreateDateColumn() created_at: Date
}
