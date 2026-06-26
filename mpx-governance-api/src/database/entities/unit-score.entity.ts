import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('unit_scores')
@Index(['score_snapshot_id', 'organization_unit_id'], { unique: true })
export class UnitScore {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) score_snapshot_id: string
  @Column({ type: 'uuid' }) organization_unit_id: string
  @Column({ length: 255, nullable: true }) organization_unit_name: string
  @Column({ type: 'uuid', nullable: true }) region_id: string
  @Column({ length: 20, nullable: true }) province_code: string
  @Column({ length: 30, nullable: true }) profile_level: string
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) readiness_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) compliance_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) control_evidence_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) operational_score: number
  @Column({ type: 'int', default: 0 }) incomplete_records: number
  @Column({ type: 'int', default: 0 }) open_actions: number
  @Column({ type: 'int', default: 0 }) overdue_actions: number
  @Column({ length: 30, nullable: true }) risk_status: string
  @Column({ type: 'int', default: 0 }) record_count: number
}
