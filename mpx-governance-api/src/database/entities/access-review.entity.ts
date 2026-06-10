import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('access_reviews')
export class AccessReview {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 20, nullable: true }) review_cycle: string  // e.g. 2026-Q2

  @Column({ type: 'uuid', nullable: true }) reviewer_id: string
  @Column({ length: 255, nullable: true }) reviewer_name: string
  @Column({ type: 'uuid', nullable: true }) user_under_review_id: string
  @Column({ length: 255, nullable: true }) user_under_review_name: string

  @Column({ length: 255, nullable: true }) system_name: string
  @Column({ length: 20, nullable: true })
  @ApiProperty({ enum: ['read', 'write', 'admin', 'full'] }) access_level: string
  @Column({ type: 'text', nullable: true }) access_scope: string

  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['retain', 'modify', 'revoke', 'pending'] }) decision: string
  @Column({ type: 'text', nullable: true }) justification: string

  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'completed'] }) status: string

  @Column({ type: 'date', nullable: true }) due_date: Date
  @Column({ type: 'timestamptz', nullable: true }) reviewed_at: Date
  @Column({ type: 'text', nullable: true }) notes: string
  @Column({ type: 'uuid', nullable: true }) created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
