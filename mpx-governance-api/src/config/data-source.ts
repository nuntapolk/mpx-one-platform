import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

// Resolve TS sources in dev (ts-node) and compiled JS in production (node dist/*).
const isCompiled = __filename.endsWith('.js')
const root = isCompiled ? 'dist' : 'src'
const ext = isCompiled ? 'js' : 'ts'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mpx:mpxsecret@localhost:5432/mpx_one',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [`${root}/database/entities/*.${ext}`],
  migrations: [`${root}/database/migrations/*.${ext}`],
})
