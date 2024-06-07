import type { Config } from 'drizzle-kit'

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.NODE_ENV === 'production'
      ? process.env.TURSO_DATABASE_URL || ''
      : 'file:sqlite.db',
    authToken: process.env.NODE_ENV === 'production'
      ? process.env.TURSO_AUTH_TOKEN
      : undefined,
  },
} satisfies Config
