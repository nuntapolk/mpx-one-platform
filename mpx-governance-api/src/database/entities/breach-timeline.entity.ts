import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('breach_timelines')
export class BreachTimeline {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'uuid' }) breach_incident_id: string
  @Column({ length: 100 }) action: string
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'uuid', nullable: true }) user_id: string
  @Column({ length: 255, nullable: true }) user_name: string
  @CreateDateColumn() created_at: Date
}
