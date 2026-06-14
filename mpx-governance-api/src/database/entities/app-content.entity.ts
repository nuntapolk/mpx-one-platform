import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

// Generic editable page/content store (e.g. the About page). Keyed per org + key.
@Entity('app_content')
@Index(['organization_id', 'key'], { unique: true })
export class AppContent {
  @PrimaryGeneratedColumn('uuid') @ApiProperty() id: string
  @Column({ type: 'uuid' }) organization_id: string
  @Column({ length: 100 }) @ApiProperty({ description: 'content key, e.g. "about"' }) key: string
  @Column({ type: 'jsonb', nullable: true }) @ApiProperty() value: any
  @Column({ length: 255, nullable: true }) updated_by: string
  @UpdateDateColumn() updated_at: Date
}
