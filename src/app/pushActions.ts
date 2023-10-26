'use server'

import { eq } from 'drizzle-orm'
import { MutationV1 } from 'replicache'
import { MessageWithID } from '@replicache/types'
import { replicacheServer, replicacheClient, message } from 'drizzle/schema'
import db, { serverID } from 'db'

export async function getLastMutationID(clientID: string) {
  const clientRowStatementQuery = db
    .select({ last_mutation_id: replicacheClient.last_mutation_id })
    .from(replicacheClient)
    .where(eq(replicacheClient.id, clientID))
    .prepare()

  const clientRow = clientRowStatementQuery.get()

  return clientRow?.last_mutation_id || 0
}

export async function createMessage(
  {
    id, from, content, order,
  }: MessageWithID,
  version: number,
) {
  const insertMessageStatementQuery = db
    .insert(message)
    .values({
      id,
      sender: from,
      content,
      ord: order,
      deleted: false,
      version,
    })
    .prepare()

  insertMessageStatementQuery.run()
}

export async function setLastMutationID(
  clientID: string,
  clientGroupID: string,
  mutationID: number,
  version: number,
) {
  const resultStatementQuery = db
    .update(replicacheClient)
    .set({
      client_group_id: clientGroupID,
      last_mutation_id: mutationID,
      version,
    })
    .where(eq(replicacheClient.id, clientID))
    .prepare()

  const result = resultStatementQuery.run()

  if (result.changes === 0) {
    const insertStatementQuery = db
      .insert(replicacheClient)
      .values({
        id: clientID,
        client_group_id: clientGroupID,
        last_mutation_id: mutationID,
        version,
      })
      .prepare()

    insertStatementQuery.run()
  }
}

export async function processMutation(
  clientGroupID: string,
  mutation: MutationV1,
  error?: string | undefined,
) {
  const { clientID } = mutation

  // Get the previous version and calculate the next one.
  const previousVersionStatementQuery = db
    .select({ version: replicacheServer.version })
    .from(replicacheServer)
    .where(eq(replicacheServer.id, serverID))
    .prepare()

  const previousVersionStatement = previousVersionStatementQuery.get()
  const previousVersion = previousVersionStatement?.version ?? 0
  const nextVersion = previousVersion + 1

  const lastMutationID = await getLastMutationID(clientID)
  const nextMutationID = lastMutationID + 1

  console.log('nextVersion', nextVersion, 'nextMutationID', nextMutationID)

  // It's common due to connectivity issues for clients to send a
  // mutation which has already been processed. Skip these.
  if (mutation.id < nextMutationID) {
    console.log(`Mutation ${mutation.id} has already been processed - skipping`)
    return
  }

  // If the Replicache client is working correctly, this can never
  // happen. If it does there is nothing to do but return an error to
  // client and report a bug to Replicache.
  if (mutation.id > nextMutationID) {
    throw new Error(`Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear application data in browser and refresh.`)
  }

  if (error === undefined) {
    console.log('Processing mutation:', JSON.stringify(mutation))

    // For each possible mutation, run the server-side logic to apply the
    // mutation.
    switch (mutation.name) {
      case 'createMessage':
        await createMessage(mutation.args as MessageWithID, nextVersion)
        break
      default:
        throw new Error(`Unknown mutation: ${mutation.name}`)
    }
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log('Handling error from mutation', JSON.stringify(mutation), error)
  }

  console.log('setting', clientID, 'last_mutation_id to', nextMutationID)

  // Update lastMutationID for requesting client.
  await setLastMutationID(clientID, clientGroupID, nextMutationID, nextVersion)

  // Update global version.
  const updateVersionStatementQuery = db.update(replicacheServer)
    .set({ version: nextVersion })
    .where(eq(replicacheServer.id, serverID))
    .prepare()

  updateVersionStatementQuery.run()
}

export async function sendPoke() {
// TODO
}
