import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('module_scores')
@Index(['score_snapshot_id', 'module_code'], { unique: true })
export class ModuleScore {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) score_snapshot_id: string
  @Column({ length: 100 }) module_code: string
  @Column({ length: 255 }) module_name: string
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) module_score: number
  @Column({ length: 30, nullable: true }) status: string
  @Column({ type: 'int', default: 0 }) completed_count: number
  @Column({ type: 'int', default: 0 }) incomplete_count: number
  @Column({ type: 'int', default: 0 }) overdue_count: number
  @Column({ type: 'int', default: 0 }) evidence_count: number
  @Column({ type: 'int', default: 0 }) total_count: number
}
