import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export interface FieldOption { value: string; label: string }

@Entity('ropa_field_configs')
@Index(['organization_id', 'field_key'], { unique: true })
export class RopaFieldConfig {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 100 }) @ApiProperty() field_key: string
  @Column({ length: 255 }) @ApiProperty() field_label: string
  @Column({ length: 20, default: 'text' })
  @ApiProperty({ enum: ['text', 'textarea', 'select', 'checkbox', 'date', 'number'] }) field_type: string

  @Column({ type: 'jsonb', nullable: true }) field_options: FieldOption[]
  @Column({ default: false }) is_required: boolean
  @Column({ default: true }) is_active: boolean
  @Column({ type: 'int', default: 0 }) sort_order: number
  @Column({ length: 100, default: 'general' }) section: string
  @Column({ type: 'text', nullable: true }) help_text: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
