import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

// Pivot table: Evidence ↔ Control/Risk/Assessment/Issue
@Entity('evidence_links')
export class EvidenceLink {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  evidence_id: string

  @Column()
  // 'control' | 'risk' | 'assessment' | 'assessment_response' | 'issue' | 'obligation'
  linked_type: string

  @Column()
  linked_id: string

  @Column({ type: 'text', nullable: true })
  note: string

  @Column({ nullable: true })
  created_by: string

  @CreateDateColumn() created_at: Date
}
