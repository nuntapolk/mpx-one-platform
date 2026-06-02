import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('assessment_responses')
export class AssessmentResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  assessment_id: string

  @Column()
  control_id: string

  @Column({ nullable: true })
  template_control_id: string

  // Pass/Fail model
  @Column({ nullable: true })
  @ApiProperty({ enum: ['pass', 'fail', 'na', null], required: false })
  pass_fail: string

  // Maturity model (0–5)
  @Column({ type: 'int', nullable: true })
  maturity_score: number

  // Risk-based model
  @Column({ nullable: true })
  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical', null], required: false })
  risk_rating: string

  @Column({ type: 'text', nullable: true })
  comment: string

  @Column({ type: 'text', nullable: true })
  gap_description: string

  @Column({ default: false })
  has_finding: boolean

  @Column({ nullable: true })
  responded_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
