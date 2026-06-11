import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('audit_trails')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  organization_id: string

  @Column({ length: 50 })
  // 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'submit' | 'close'
  action: string

  @Column({ length: 100 })
  // 'framework' | 'obligation' | 'control' | 'control_mapping' | 'assessment'
  // 'risk' | 'issue' | 'evidence' | 'action_plan' | 'user' | 'role'
  object_type: string

  @Column()
  object_id: string

  @Column({ type: 'jsonb', nullable: true })
  old_value: Record<string, unknown>

  @Column({ type: 'jsonb', nullable: true })
  new_value: Record<string, unknown>

  @Column({ nullable: true })
  user_id: string

  @Column({ length: 255, nullable: true })
  user_email: string

  @Column({ length: 50, nullable: true })
  ip_address: string

  @Column({ type: 'text', nullable: true })
  remark: string

  // Tamper-evidence chain
  @Column({ length: 64, nullable: true })
  prev_hash: string

  @Column({ length: 64, nullable: true })
  hash: string

  @CreateDateColumn() created_at: Date
}
