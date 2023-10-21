import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// A single global version number for the entire database.
export const replicacheServer = sqliteTable('replicacheServer', {
  id: integer('id').primaryKey(),
  version: integer('version'),
})

export type ReplicacheServer = InferSelectModel<typeof replicacheServer>
export type InsertReplicacheServer = InferSelectModel<typeof replicacheServer>

// Stores chat messages.
export const message = sqliteTable('message', {
  id: text('id').primaryKey(),
  sender: text('sender'),
  content: text('content'),
  ord: integer('ord'),
  deleted: integer('deleted', { mode: 'boolean' }),
  version: integer('version'),
})

export type Message = InferSelectModel<typeof message>
export type InsertMessage = InferInsertModel<typeof message>

// Stores last mutationID processed for each Replicache client.
export const replicacheClient = sqliteTable('replicacheClient', {
  id: text('id').primaryKey(),
  client_group_id: text('client_group_id'),
  last_mutation_id: integer('last_mutation_id'),
  version: integer('version'),
})

export type ReplicacheClient = InferSelectModel<typeof replicacheClient>
export type InsertReplicacheClient = InferInsertModel<typeof replicacheClient>
