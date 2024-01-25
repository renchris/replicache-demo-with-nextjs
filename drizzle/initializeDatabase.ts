import { replicacheMeta } from './schema'
import db from './db'

// consider default values https://orm.drizzle.team/docs/indexes-constraints#default

const initializeDatabase = () => {
  const rows = db
    .select()
    .from(replicacheMeta)
    .prepare()
    .all()

  if (rows.length === 0) {
    // Insert a row to set the global database version in the replicacheServer table.
    console.log('initializing database...')
    db.insert(replicacheMeta)
      .values({
        key: 'schemaVersion',
        value: '1',
      }).run()
  } else {
    console.log('database already initialized.')
  }
}

initializeDatabase()
