import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('training_completions')
export class TrainingCompletion {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ type: 'uuid' }) course_id: string
  @Column({ type: 'uuid', nullable: true }) user_id: string
  @Column({ length: 255, nullable: true }) user_name: string
  @Column({ type: 'int', nullable: true }) score: number
  @Column({ default: false }) passed: boolean
  @Column({ type: 'int', default: 1 }) attempt_number: number
  @Column({ length: 100, nullable: true }) certificate_number: string
  @Column({ type: 'timestamptz', nullable: true }) started_at: Date
  @Column({ type: 'timestamptz', nullable: true }) completed_at: Date
  @Column({ type: 'timestamptz', nullable: true }) expires_at: Date
  @CreateDateColumn() created_at: Date
}
