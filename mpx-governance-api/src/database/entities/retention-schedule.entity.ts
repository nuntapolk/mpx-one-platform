import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('retention_schedules')
export class RetentionSchedule {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 255 }) @ApiProperty() data_category: string
  @Column({ type: 'int', default: 1 }) @ApiProperty() retention_years: number
  @Column({ length: 500, nullable: true }) legal_basis: string
  @Column({ type: 'text', nullable: true }) notes: string
  @Column({ default: true }) is_active: boolean

  // optional link to processing activity (ROPA)
  @Column({ type: 'uuid', nullable: true }) related_ropa_id: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
