import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('ai_tools')
export class AITool {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ length: 255 })
  @ApiProperty()
  vendor: string

  @Column({ length: 500 })
  @ApiProperty()
  use_case: string

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ enum: [1, 2, 3, 4], description: '1=highest risk, 4=lowest risk' })
  tier: number

  @Column({ default: 'pending' })
  @ApiProperty({ enum: ['pending', 'review', 'approved', 'rejected'] })
  status: string

  @Column({ type: 'jsonb', default: {} })
  @ApiProperty({
    example: {
      dataPrivacy: 4,
      security: 4,
      transparency: 5,
      biasAndFairness: 3,
      accountability: 4,
    },
  })
  scores: {
    dataPrivacy: number
    security: number
    transparency: number
    biasAndFairness: number
    accountability: number
  }

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
