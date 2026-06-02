import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('assessment_template_controls')
export class AssessmentTemplateControl {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  template_id: string

  @Column()
  control_id: string

  @Column({ type: 'int', default: 0 })
  sort_order: number

  @Column({ default: true })
  is_required: boolean

  @Column({ type: 'text', nullable: true })
  guidance: string

  @CreateDateColumn() created_at: Date
}
