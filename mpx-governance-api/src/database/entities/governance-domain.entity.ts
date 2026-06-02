import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('governance_domains')
export class GovernanceDomain {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column({ type: 'uuid' })
  organization_id: string

  @Column({ length: 100 })
  @ApiProperty()
  code: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ length: 1000, nullable: true })
  description: string

  @Column({ type: 'uuid', nullable: true })
  domain_owner_id: string

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
