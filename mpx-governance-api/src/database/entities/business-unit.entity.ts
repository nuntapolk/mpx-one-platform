import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('business_units')
export class BusinessUnit {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column({ type: 'uuid' })
  organization_id: string

  @Column({ type: 'uuid', nullable: true })
  parent_id: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ default: 'department' })
  @ApiProperty({ enum: ['organization', 'business_unit', 'department', 'team', 'branch'] })
  type: string

  @Column({ length: 500, nullable: true })
  description: string

  @Column({ type: 'uuid', nullable: true })
  head_user_id: string

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
