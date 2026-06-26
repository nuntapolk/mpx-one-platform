import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('score_source_metrics')
@Index(['score_snapshot_id', 'metric_code'])
export class ScoreSourceMetric {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) score_snapshot_id: string
  @Column({ length: 100 }) metric_code: string
  @Column({ length: 255 }) metric_name: string
  @Column({ length: 100, nullable: true }) metric_group: string
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 }) metric_value: number
  @Column({ length: 50, nullable: true }) metric_unit: string
  @Column({ length: 100, nullable: true }) source_module: string
  @CreateDateColumn() created_at: Date
}
