import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('it_assets')
export class ITAsset {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ length: 100 })
  @ApiProperty({ enum: ['server', 'application', 'network', 'endpoint', 'cloud', 'other'] })
  type: string

  @Column({ length: 255 })
  @ApiProperty()
  owner: string

  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive', 'decommissioned'] })
  status: string

  @Column({ type: 'simple-array', default: '' })
  @ApiProperty({ type: [String] })
  tags: string[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
