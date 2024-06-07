'use server'

import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from 'drizzle/schema'
import { headers } from 'next/headers'

const getSubdomain = async (): Promise<string> => {
  const headersList = headers()
  const host = headersList.get('host') || ''
  if (host === 'localhost:3000') {
    return ''
  }
  const subdomain = host.split('.')[0]
  return subdomain
}

const getDB = async (): Promise<LibSQLDatabase<typeof schema>> => {
  let url: string
  let authToken: string | undefined
  let turso: Client

  if (process.env.secrets) {
    const secretObject = JSON.parse(process.env.secrets)
    url = secretObject.TURSO_PARENT_SCHEMA_DATABASE_URL
    authToken = secretObject.TURSO_AUTH_TOKEN
  } else if (process.env.NODE_ENV === 'production') {
    const subdomain = await getSubdomain()
    url = `libsql://${subdomain}${process.env.TURSO_ORGANIZATION_URL}` || ''
    authToken = process.env.TURSO_AUTH_TOKEN || ''
  } else {
    url = 'file:sqlite.db'
    authToken = undefined
  }

  try {
    turso = createClient({ url, authToken })
  } catch (err) {
    const createClientError = err as Error
    throw new Error(createClientError.message)
  }

  const db: LibSQLDatabase<typeof schema> = drizzle(turso, { schema })

  return db
}

export const serverID = 1

export default getDB
