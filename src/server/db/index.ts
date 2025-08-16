import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Create the connection - will use DATABASE_URL from env
// Check if DATABASE_URL exists, provide a dummy URL during build if not
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@host:5432/db'
const sql = neon(databaseUrl)
export const db = drizzle(sql, { schema })

// Export schema for easy access
export * from './schema'
