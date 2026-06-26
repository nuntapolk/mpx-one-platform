import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('score_components')
@Index(['score_snapshot_id', 'component_code'], { unique: true })
export class ScoreComponent {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) score_snapshot_id: string
  @Column({ length: 100 }) component_code: string
  @Column({ length: 255 }) component_name: string
  @Column({ type: 'decimal', precision: 5, scale: 2 }) weight_percent: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) raw_score: number
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) weighted_score: number
  @Column({ length: 30, nullable: true }) score_status: string
  @Column({ type: 'text', nullable: true }) calculation_note: string
}
