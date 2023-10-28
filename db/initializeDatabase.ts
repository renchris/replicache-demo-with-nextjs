import { replicacheServer } from '../drizzle/schema'
import db, { serverID } from './index'

const initializeDatabase = () => {
  const rows = db
    .select()
    .from(replicacheServer)
    .prepare()
    .all()

  if (rows.length === 0) {
    // Insert a row to set the global database version in the replicacheServer table.
    console.log('initializing database...')
    db.insert(replicacheServer)
      .values({
        id: serverID,
        version: 1,
      }).run()
  } else {
    console.log('database already initialized.')
  }
}

initializeDatabase()
