import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Access level per sidebar nav item: none < view < add < full
export type AccessLevel = 'none' | 'view' | 'add' | 'full'

@Entity('roles')
@Index(['organization_id', 'key'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 50 }) @ApiProperty() key: string
  @Column({ length: 100 }) @ApiProperty() label: string
  @Column({ type: 'text', nullable: true }) description: string

  // System roles (admin, dpo, viewer) cannot be deleted.
  @Column({ default: false }) is_system: boolean

  // { [navItemId]: 'none'|'view'|'add'|'full' }
  @Column({ type: 'jsonb', default: () => "'{}'" }) permissions: Record<string, AccessLevel>

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
