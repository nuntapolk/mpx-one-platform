import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('change_requests')
export class ChangeRequest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 500 })
  @ApiProperty()
  description: string

  @Column({ default: 'normal' })
  @ApiProperty({ enum: ['normal', 'standard', 'emergency'] })
  type: string

  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'approved', 'rejected', 'completed'] })
  status: string

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  @ApiProperty()
  requested_at: Date

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  requested_by: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
