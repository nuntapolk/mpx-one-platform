import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ length: 100, unique: true }) @ApiProperty() slug: string
  @Column({ type: 'uuid', nullable: true }) organization_id: string
  @Column({ default: true }) is_active: boolean
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
