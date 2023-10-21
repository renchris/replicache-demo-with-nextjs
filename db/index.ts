import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const sqlite = new Database('sqlite.db')
const db: BetterSQLite3Database = drizzle(sqlite)

migrate(db, { migrationsFolder: 'drizzle' })

export default db
