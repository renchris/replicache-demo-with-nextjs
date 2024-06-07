'use server'

import { eq } from 'drizzle-orm'
import type { MutationV1 } from 'replicache'
import type {
  Affected, ClientGroupRecord, ClientRecord, List as ReplicacheList, Share, Todo,
} from '@replicache/types'
import {
  replicacheClient,
} from 'drizzle/schema'
import getDB from 'drizzle/db'
import { getClientGroupForUpdate, putClientGroup } from './sharedActions'
import {
  createList, createShare, createTodo, deleteList, deleteShare, deleteTodo, updateTodo,
} from './appActions'

async function getClient(
  clientID: string,
): Promise<Omit<ClientRecord, 'id'>> {
  const db = await getDB()
  const clientRowStatementQuery = db
    .select({
      clientGroupID: replicacheClient.clientGroupID,
      lastMutationID: replicacheClient.lastMutationID,
      clientVersion: replicacheClient.clientVersion,
    })
    .from(replicacheClient)
    .where(eq(replicacheClient.id, clientID))
    .prepare()

  const clientRow = await clientRowStatementQuery.get() || {
    clientGroupID: '',
    lastMutationID: 0,
    clientVersion: 0,
  }

  return clientRow
}

async function getClientForUpdate(
  clientID: string,
): Promise<ClientRecord> {
  const previousClient = await getClient(clientID)
  return {
    id: clientID,
    clientGroupID: previousClient.clientGroupID,
    lastMutationID: previousClient.lastMutationID,
    clientVersion: previousClient.clientVersion,
  }
}

async function mutate(
  userID: string,
  mutation: MutationV1,
): Promise<Affected> {
  switch (mutation.name) {
    case 'createList':
      return createList(userID, mutation.args as ReplicacheList)
    case 'deleteList':
      return deleteList(userID, mutation.args as string)
    case 'createTodo':
      return createTodo(userID, mutation.args as Omit<Todo, 'sort'>)
    case 'createShare':
      return createShare(userID, mutation.args as Share)
    case 'deleteShare':
      return deleteShare(userID, mutation.args as string)
    case 'updateTodo':
      return updateTodo(userID, mutation.args as Todo)
    case 'deleteTodo':
      return deleteTodo(userID, mutation.args as string)
    default:
      return Promise.resolve({
        listIDs: [],
        userIDs: [],
      })
  }
}

async function putClient(
  client: ClientRecord,
) {
  const {
    id, clientGroupID, lastMutationID, clientVersion,
  } = client
  const db = await getDB()
  const insertClientStatementQuery = db
    .insert(replicacheClient)
    .values({
      id,
      clientGroupID,
      lastMutationID,
      clientVersion,
      lastModified: new Date(),
    })
    .onConflictDoUpdate({
      target: replicacheClient.id,
      set: {
        lastMutationID,
        clientVersion,
        lastModified: new Date(),
      },
    })
    .prepare()

  await insertClientStatementQuery.run()
}

async function processMutation(
  clientGroupID: string,
  userID: string,
  mutation: MutationV1,
  error?: string | undefined,
): Promise<{
    affected: Affected;
  }> {
  let affected: Affected = { listIDs: [], userIDs: [] }
  console.log(
    error === undefined ? 'Processing mutation' : 'Processing mutation error',
    JSON.stringify(mutation, null, ''),
  )

  const baseClientGroup = await getClientGroupForUpdate(clientGroupID)
  const baseClient = await getClientForUpdate(mutation.clientID)

  console.log('baseClientGroup', { baseClientGroup }, 'baseClient', { baseClient })

  const nextClientVersion = baseClientGroup.clientGroupVersion + 1
  const nextMutationID = baseClient.lastMutationID + 1

  console.log('nextClientVersion', nextClientVersion, 'nextMutationID', nextMutationID)

  // It's common due to connectivity issues for clients to send a
  // mutation which has already been processed. Skip these.
  if (mutation.id < nextMutationID) {
    console.log(`Mutation ${mutation.id} has already been processed - skipping`)
    return { affected }
  }

  // If the Replicache client is working correctly, this can never
  // happen. If it does there is nothing to do but return an error to
  // client and report a bug to Replicache.
  if (mutation.id > nextMutationID) {
    throw new Error(`Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear application data in browser and refresh.`)
  }

  if (error === undefined) {
    console.log('Processing mutation:', JSON.stringify(mutation))
    try {
      affected = await mutate(userID, mutation)
    } catch (mutateError: unknown) {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
      console.log(`Handling error from mutation "${mutation.name}":`)
      console.log(JSON.stringify(mutation))
      throw mutateError
    }
  }

  const nextClientGroup: ClientGroupRecord = {
    id: clientGroupID,
    cvrVersion: baseClientGroup.cvrVersion,
    clientGroupVersion: nextClientVersion,
  }

  const nextClient: ClientRecord = {
    id: mutation.clientID,
    clientGroupID,
    lastMutationID: nextMutationID,
    clientVersion: nextClientVersion,
  }

  await putClientGroup(nextClientGroup)
  await putClient(nextClient)

  return { affected }
}

export default processMutation
