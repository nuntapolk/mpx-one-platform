import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// M01-FR04 — polymorphic owner model: one object can have many owners of many types
@Entity('owner_assignments')
@Index(['organization_id', 'object_type', 'object_id'])
export class OwnerAssignment {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 100 })
  @ApiProperty({ description: 'application | data_asset | ropa | vendor | project | ai_use_case | risk | control | evidence | issue' })
  object_type: string
  @Column({ type: 'uuid' }) object_id: string

  @Column({ type: 'uuid' }) user_id: string
  @Column({ length: 100 })
  @ApiProperty({ enum: ['business_owner', 'system_owner', 'data_owner', 'data_steward', 'risk_owner', 'control_owner', 'evidence_owner', 'project_owner', 'vendor_owner', 'ai_use_case_owner', 'reviewer', 'approver'] })
  owner_type: string

  @Column({ length: 255, nullable: true }) user_name: string
  @CreateDateColumn() created_at: Date
}
