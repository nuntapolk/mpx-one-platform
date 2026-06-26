import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('score_snapshots')
@Index(['tenant_id', 'assessment_period', 'is_latest'])
export class ScoreSnapshot {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid', nullable: true }) tenant_id: string
  @Column({ length: 20 }) @ApiProperty() assessment_period: string
  @Column({ type: 'uuid', nullable: true }) organization_unit_id: string
  @Column({ type: 'uuid', nullable: true }) region_id: string
  @Column({ length: 20, nullable: true }) province_code: string
  @Column({ length: 100, nullable: true }) process_category: string
  @Column({ length: 30, nullable: true }) profile_level: string
  @Column({ length: 64, nullable: true }) scope_hash: string
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) overall_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) compliance_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) control_evidence_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) operational_score: number
  @Column({ length: 30, default: 'completed' }) status: string
  @Column({ type: 'uuid', nullable: true }) methodology_version_id: string
  @Column({ type: 'int', default: 0 }) record_count: number
  @Column({ default: true }) is_latest: boolean
  @Column({ type: 'timestamptz', nullable: true }) calculated_at: Date
  @Column({ length: 20, default: 'system' }) calculated_by_type: string
  @Column({ type: 'uuid', nullable: true }) calculated_by_user_id: string
  @Column({ type: 'jsonb', nullable: true }) warnings_json: any
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
