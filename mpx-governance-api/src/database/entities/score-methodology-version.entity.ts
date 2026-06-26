import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('score_methodology_versions')
@Index(['tenant_id', 'is_active'])
export class ScoreMethodologyVersion {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid', nullable: true }) tenant_id: string
  @Column({ length: 50, unique: true }) @ApiProperty() version_code: string
  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'jsonb' }) @ApiProperty() weight_config: any
  @Column({ type: 'jsonb', nullable: true }) formula_config: any
  @Column({ type: 'jsonb', nullable: true }) threshold_config: any
  @Column({ default: false }) is_active: boolean
  @Column({ type: 'timestamptz', nullable: true }) effective_from: Date
  @Column({ type: 'timestamptz', nullable: true }) effective_to: Date
  @Column({ nullable: true }) created_by: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
