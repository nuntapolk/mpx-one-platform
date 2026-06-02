import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('reg_mappings')
export class RegMapping {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string

  @Column()
  @ApiProperty()
  organization_id: string

  @Column({ length: 500 })
  @ApiProperty()
  control_name: string

  @Column({ length: 255 })
  @ApiProperty({ example: 'PDPA', enum: ['PDPA', 'BOT IT Risk', 'NCSA', 'NIST CSF', 'ISO 27001'] })
  framework: string

  @Column({ length: 500 })
  @ApiProperty()
  clause: string

  @Column({ default: 'mapped' })
  @ApiProperty({ enum: ['mapped', 'partial', 'not-mapped'] })
  status: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
