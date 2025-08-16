import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Create the connection - will use DATABASE_URL from env
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// Export schema for easy access
export * from './schema'