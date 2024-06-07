'use server'

import { replicacheMeta } from './schema'
import getDB from './db'

// consider default values https://orm.drizzle.team/docs/indexes-constraints#default

const initializeDatabase = async () => {
  const db = await getDB()
  const rows = await db
    .select()
    .from(replicacheMeta)
    .prepare()
    .all()

  if (rows.length === 0) {
    // Insert a row to set the global database version in the replicacheServer table.
    console.log('initializing database...')
    await db.insert(replicacheMeta)
      .values({
        key: 'schemaVersion',
        value: '1',
      }).run()
  } else {
    console.log('database already initialized.')
  }
}

initializeDatabase()
