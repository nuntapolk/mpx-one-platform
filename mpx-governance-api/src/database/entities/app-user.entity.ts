import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Maps a Keycloak identity (by email) to an organization + app roles.
@Entity('app_users')
@Index(['email'], { unique: true })
export class AppUser {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string

  @Column({ length: 255 }) @ApiProperty() email: string
  @Column({ length: 255, nullable: true }) name: string
  @Column({ length: 100, nullable: true }) keycloak_id: string
  @Column({ type: 'simple-array', nullable: true }) roles: string[]
  @Column({ default: true }) is_active: boolean
  @Column({ type: 'timestamptz', nullable: true }) last_login_at: Date

  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
