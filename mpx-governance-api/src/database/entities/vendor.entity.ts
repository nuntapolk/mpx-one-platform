import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) vendor_code: string
  @Column({ length: 255 }) @ApiProperty() vendor_name: string
  @Column({ length: 100, nullable: true })
  @ApiProperty({ enum: ['software_vendor', 'cloud_provider', 'outsourcing_provider', 'data_processor', 'ai_tool_provider', 'consultant', 'infrastructure_provider', 'other'] })
  vendor_type: string
  @Column({ type: 'text', nullable: true }) service_description: string

  @Column({ type: 'uuid', nullable: true }) business_owner_id: string
  @Column({ type: 'uuid', nullable: true }) contract_owner_id: string

  @Column({ default: false }) data_processor_flag: boolean
  @Column({ default: false }) cloud_provider_flag: boolean
  @Column({ default: false }) ai_provider_flag: boolean
  @Column({ default: false }) outsourcing_flag: boolean
  @Column({ default: false }) critical_vendor_flag: boolean

  @Column({ type: 'date', nullable: true }) contract_start_date: Date
  @Column({ type: 'date', nullable: true }) contract_end_date: Date
  @Column({ default: false }) sla_available_flag: boolean
  @Column({ default: false }) dpa_available_flag: boolean
  @Column({ default: false }) audit_right_flag: boolean

  @Column({ default: 'medium' })
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] }) risk_level: string
  @Column({ default: 'active' }) status: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
