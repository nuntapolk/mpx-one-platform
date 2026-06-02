import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('assessment_templates')
export class AssessmentTemplate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column({ length: 255 })
  @ApiProperty()
  name: string

  @Column({ default: 'control_self_assessment' })
  @ApiProperty({
    enum: ['control_self_assessment', 'risk_assessment', 'maturity_assessment',
           'pdpa_assessment', 'it_risk_assessment', 'third_party_assessment', 'ai_assessment']
  })
  type: string

  @Column({ nullable: true })
  framework_id: string

  @Column({ length: 100, nullable: true })
  related_domain_code: string

  @Column({ default: 'pass_fail' })
  @ApiProperty({ enum: ['pass_fail', 'maturity_0_5', 'risk_based'] })
  scoring_model: string

  @Column({ default: 'annual' })
  @ApiProperty({ enum: ['one_time', 'annual', 'semi_annual', 'quarterly', 'monthly', 'ad_hoc'] })
  frequency: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive', 'draft'] })
  status: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
