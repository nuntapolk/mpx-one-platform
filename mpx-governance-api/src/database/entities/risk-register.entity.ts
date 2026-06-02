import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('risk_registers')
export class RiskRegister {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  organization_id: string

  @Column({ unique: true, length: 50 })
  risk_id: string  // RSK-2026-001

  @Column({ length: 500 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'it_risk' })
  @ApiProperty({ enum: ['it_risk', 'cyber_risk', 'privacy_risk', 'data_risk', 'ai_risk', 'third_party_risk', 'compliance_risk', 'operational_risk'] })
  category: string

  @Column({ length: 100, nullable: true })
  related_domain_code: string

  @Column({ nullable: true })
  related_asset: string

  @Column({ nullable: true })
  related_process: string

  @Column({ nullable: true })
  owner_id: string

  @Column({ nullable: true })
  business_unit_id: string

  @Column({ type: 'text', nullable: true })
  cause: string

  @Column({ type: 'text', nullable: true })
  impact_description: string

  // Inherent risk
  @Column({ type: 'int', default: 3 })
  likelihood: number  // 1–5

  @Column({ type: 'int', default: 3 })
  impact: number  // 1–5

  @Column({ type: 'int', generatedType: 'STORED', asExpression: 'likelihood * impact', nullable: true })
  inherent_score: number

  // Control & residual
  @Column({ type: 'text', nullable: true })
  existing_control: string

  @Column({ default: 'partial' })
  @ApiProperty({ enum: ['effective', 'partial', 'ineffective', 'not_tested'] })
  control_effectiveness: string

  @Column({ type: 'int', nullable: true })
  residual_likelihood: number

  @Column({ type: 'int', nullable: true })
  residual_impact: number

  // Treatment
  @Column({ default: 'mitigate' })
  @ApiProperty({ enum: ['avoid', 'mitigate', 'transfer', 'accept'] })
  treatment: string

  @Column({ type: 'date', nullable: true })
  due_date: Date

  @Column({ default: 'open' })
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved', 'accepted', 'closed'] })
  status: string

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
