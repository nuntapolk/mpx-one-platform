import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('privacy_notices')
export class PrivacyNotice {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ default: 'website' })
  @ApiProperty({ enum: ['website', 'mobile_app', 'recruitment', 'employee', 'cctv', 'cookie', 'other'] })
  type: string
  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ length: 10, default: 'th' }) language: string
  @Column({ default: '1.0', length: 20 }) version: string
  @Column({ type: 'text', nullable: true }) content: string

  @Column({ type: 'date', nullable: true }) effective_date: Date
  @Column({ type: 'timestamptz', nullable: true }) published_at: Date
  @Column({ type: 'timestamptz', nullable: true }) expires_at: Date

  @Column({ default: false }) is_active: boolean
  @Column({ length: 500, nullable: true }) public_url: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @Column({ type: 'uuid', nullable: true }) approved_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
