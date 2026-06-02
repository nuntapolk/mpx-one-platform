import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ unique: true, length: 100 })
  @ApiProperty()
  slug: string

  @Column({ default: 'free' })
  @ApiProperty({ enum: ['free', 'pro', 'enterprise'] })
  plan: string

  @Column({ type: 'jsonb', default: {} })
  @ApiProperty()
  settings: Record<string, unknown>

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
