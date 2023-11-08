import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import {
  sqliteTable, text, integer, blob,
} from 'drizzle-orm/sqlite-core'

export const replicacheMeta = sqliteTable('replicache_meta', {
  key: text('key').primaryKey(),
  value: blob('value', { mode: 'json' }),
})

export type ReplicacheMeta = InferSelectModel<typeof replicacheMeta>
export type InsertReplicacheMeta = InferInsertModel<typeof replicacheMeta>

// Stores last mutationID processed for each Replicache client.
export const replicacheClient = sqliteTable('replicache_client', {
  id: text('id').primaryKey().notNull(),
  client_group_id: text('client_group_id').notNull(),
  last_mutation_id: integer('last_mutation_id').notNull(),
  version: integer('version').notNull(),
  last_modified: integer('last_modified', { mode: 'timestamp_ms' }).notNull(),
})

export type ReplicacheClient = InferSelectModel<typeof replicacheClient>
export type InsertReplicacheClient = InferInsertModel<typeof replicacheClient>

// cvrversion is null until first pull initializes it.
export const replicacheClientGroup = sqliteTable('replicache_client_group', {
  id: text('id').primaryKey().notNull(),
  cvr_version: integer('cvr_version'),
  client_group_version: integer('client_group_version').notNull(),
  last_modified: integer('last_modified', { mode: 'timestamp_ms' }).notNull(),
})

export type ReplicacheClientGroup = InferSelectModel<typeof replicacheClientGroup>
export type InsertReplicacheClientGroup = InferInsertModel<typeof replicacheClientGroup>

// Application domain entities

export const list = sqliteTable('list', {
  id: text('id').primaryKey().notNull(),
  owner_id: text('owner_id').notNull(),
  name: text('name').notNull(),
  row_version: integer('row_version').notNull(),
  last_modified: integer('last_modified', { mode: 'timestamp_ms' }).notNull(),
})

export type List = InferSelectModel<typeof list>
export type InsertList = InferInsertModel<typeof list>

export const share = sqliteTable('share', {
  id: text('id').primaryKey().notNull(),
  list_id: text('list_id').notNull(),
  user_id: text('user_id').notNull(),
  row_version: integer('row_version').notNull(),
  last_modified: integer('last_modified', { mode: 'timestamp_ms' }).notNull(),
})

export type Share = InferSelectModel<typeof share>
export type InsertShare = InferInsertModel<typeof share>

export const item = sqliteTable('item', {
  id: text('id').primaryKey().notNull(),
  list_id: text('list_id').notNull(),
  title: text('title').primaryKey().notNull(),
  complete: integer('complete', { mode: 'boolean' }).notNull(),
  ord: integer('ord').notNull(),
  row_version: integer('row_version').notNull(),
  last_modified: integer('last_modified', { mode: 'timestamp_ms' }).notNull(),
})

export type Item = InferSelectModel<typeof item>
export type InsertItem = InferInsertModel<typeof item>
