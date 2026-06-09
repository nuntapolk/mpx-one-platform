import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('ropa_campaign_invitees')
export class RopaCampaignInvitee {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'uuid' }) campaign_id: string
  @Column({ length: 255 }) name: string
  @Column({ length: 255, nullable: true }) email: string
  @Column({ length: 100, nullable: true }) employee_id: string
  @Column({ length: 255, nullable: true }) department: string
  @Column({ length: 100, nullable: true }) token_id: string
  @Column({ default: 'invited' })
  status: string  // invited | reminded | submitted
  @Column({ type: 'timestamptz', nullable: true }) invited_at: Date
  @Column({ type: 'timestamptz', nullable: true }) reminded_at: Date
  @Column({ type: 'timestamptz', nullable: true }) submitted_at: Date
  @CreateDateColumn() created_at: Date
}
