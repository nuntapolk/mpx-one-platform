import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('cookie_banner_settings')
export class CookieBannerSetting {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ default: true }) is_active: boolean
  @Column({ type: 'jsonb', nullable: true }) categories: Record<string, unknown>[]  // [{key,label,required}]
  @Column({ length: 255, nullable: true }) banner_title: string
  @Column({ type: 'text', nullable: true }) banner_description: string
  @Column({ length: 100, default: 'ยอมรับทั้งหมด' }) accept_all_text: string
  @Column({ length: 100, default: 'ปฏิเสธทั้งหมด' }) reject_all_text: string
  @Column({ length: 100, default: 'ตั้งค่า' }) manage_text: string
  @Column({ length: 100, default: 'บันทึก' }) save_preferences_text: string
  @Column({ length: 500, nullable: true }) policy_url: string
  @Column({ type: 'uuid', nullable: true }) privacy_notice_id: string
  @Column({ length: 50, default: 'bottom' }) position: string
  @Column({ length: 50, default: 'light' }) theme: string
  @Column({ type: 'int', default: 365 }) consent_duration_days: number
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
