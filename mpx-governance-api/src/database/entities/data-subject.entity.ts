import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('data_subjects')
export class DataSubject {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ unique: true, length: 50 }) reference_id: string
  @Column({ default: 'customer' })
  @ApiProperty({ enum: ['customer', 'employee', 'vendor', 'prospect', 'other'] })
  type: string

  @Column({ length: 255, nullable: true }) first_name: string
  @Column({ length: 255, nullable: true }) last_name: string
  @Column({ length: 255, nullable: true }) email: string
  @Column({ length: 50, nullable: true }) phone: string
  @Column({ length: 255, nullable: true }) national_id: string
  @Column({ type: 'date', nullable: true }) date_of_birth: Date
  @Column({ length: 100, nullable: true }) nationality: string
  @Column({ type: 'text', nullable: true }) address: string

  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive', 'deletion_requested', 'deleted'] })
  status: string

  @Column({ type: 'timestamptz', nullable: true }) deleted_request_at: Date
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
