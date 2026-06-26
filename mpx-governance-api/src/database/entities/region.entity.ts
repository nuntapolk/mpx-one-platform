import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('regions')
@Index(['tenant_id', 'code'])
export class Region {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid', nullable: true }) tenant_id: string
  @Column({ length: 255 }) @ApiProperty() name: string
  @Column({ length: 50, nullable: true }) @ApiProperty() code: string
  @CreateDateColumn() created_at: Date
  @UpdateDateColumn() updated_at: Date
}
