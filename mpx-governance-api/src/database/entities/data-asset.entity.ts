import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('data_assets')
export class DataAsset {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 255 })
  @ApiProperty()
  system: string

  @Column({ default: 'internal' })
  @ApiProperty({ enum: ['confidential', 'sensitive', 'internal', 'public'] })
  classification: string

  @Column({ length: 255 })
  @ApiProperty()
  owner: string

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ minimum: 0, maximum: 100 })
  quality_score: number

  @Column({ default: 'none' })
  @ApiProperty({ enum: ['tracked', 'partial', 'none'] })
  lineage: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
