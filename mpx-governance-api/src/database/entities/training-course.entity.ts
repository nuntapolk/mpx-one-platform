import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('training_courses')
export class TrainingCourse {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 500 }) @ApiProperty() title: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'text', nullable: true }) content: string
  @Column({ type: 'int', nullable: true }) duration_minutes: number
  @Column({ default: false }) is_required: boolean
  @Column({ type: 'int', default: 80 }) passing_score: number
  @Column({ default: false }) certificate_enabled: boolean
  @Column({ type: 'int', nullable: true }) validity_months: number
  @Column({ default: true }) is_active: boolean
  @Column({ length: 100, nullable: true }) public_token: string
  @Column({ default: false }) public_enabled: boolean
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
