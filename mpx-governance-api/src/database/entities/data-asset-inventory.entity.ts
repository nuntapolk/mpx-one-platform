import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// M02-FR02 — full Data Asset registry (distinct from legacy data_assets used by old dashboard)
@Entity('data_asset_inventory')
export class DataAssetInventory {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) data_asset_code: string
  @Column({ length: 255 }) @ApiProperty() data_asset_name: string
  @Column({ type: 'text', nullable: true }) description: string

  @Column({ length: 100, nullable: true }) data_domain: string
  @Column({ type: 'uuid', nullable: true }) data_owner_id: string
  @Column({ type: 'uuid', nullable: true }) data_steward_id: string
  @Column({ type: 'uuid', nullable: true }) source_application_id: string

  @Column({ default: 'internal' })
  @ApiProperty({ enum: ['public', 'internal', 'confidential', 'restricted', 'personal_data', 'sensitive_personal_data'] })
  classification: string

  @Column({ default: false }) personal_data_flag: boolean
  @Column({ default: false }) sensitive_personal_data_flag: boolean
  @Column({ length: 255, nullable: true }) data_subject_type: string
  @Column({ length: 100, nullable: true }) retention_period: string
  @Column({ length: 100, nullable: true }) data_quality_status: string
  @Column({ length: 100, nullable: true }) sharing_status: string

  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
