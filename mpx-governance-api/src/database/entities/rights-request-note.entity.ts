import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('rights_request_notes')
export class RightsRequestNote {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'uuid' }) rights_request_id: string
  @Column({ type: 'text' }) note: string
  @Column({ type: 'uuid', nullable: true }) created_by: string
  @Column({ length: 255, nullable: true }) created_by_name: string
  @CreateDateColumn() created_at: Date
}
