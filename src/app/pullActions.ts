'use server'

import { eq, and, gt } from 'drizzle-orm'
import {
  Message, message, replicacheClient, replicacheServer,
} from 'drizzle/schema'
import db, { serverID } from 'db'
import { PatchOperation, PullResponseV1 } from 'replicache'

async function getCurrentVersion(): Promise<number> {
  const currentVersionStatementQuery = db
    .select({ version: replicacheServer.version })
    .from(replicacheServer)
    .where(eq(replicacheServer.id, serverID))
    .prepare()

  const currentVersionStatement = currentVersionStatementQuery.get()
  return currentVersionStatement?.version || 0
}

async function getLastMutationIDChanges(
  clientGroupID: string,
  fromVersion: number,
): Promise<{ [k: string]: number }> {
  const rowsStatementQuery = db
    .select({ id: replicacheClient.id, last_mutation_id: replicacheClient.last_mutation_id })
    .from(replicacheClient)
    .where(and(
      eq(replicacheClient.client_group_id, clientGroupID),
      gt(replicacheClient.version, fromVersion),
    ))
    .prepare()

  const rows = rowsStatementQuery
    .all()
    .filter((row) => row.last_mutation_id !== null)

  return Object.fromEntries(rows.map((row) => [row.id, row.last_mutation_id as number]))
}

async function getChangedDomainObjects(
  fromVersion: number,
): Promise<Message[]> {
  const changed = db
    .select()
    .from(message)
    .where(gt(message.version, fromVersion))
  return changed
}

async function getPatch(
  changedDomainObjects: Message[],
  fromVersion: number,
): Promise<PatchOperation[]> {
  const patch: PatchOperation[] = changedDomainObjects.map((row: Message) => {
    const {
      id, sender, content, ord, version: rowVersion, deleted,
    } = row

    if (deleted) {
      if (rowVersion && rowVersion > fromVersion) {
        return {
          op: 'del',
          key: `message/${id}`,
        }
      }
    }
    return {
      op: 'put',
      key: `message/${id}`,
      value: {
        from: sender,
        content,
        order: ord,
      },
    }
  })
  return patch
}

async function processPull(
  fromVersion: number,
  clientGroupID: string,
): Promise<PullResponseV1> {
  // Get current version.
  const currentVersion = await getCurrentVersion()
  if (fromVersion > currentVersion) {
    throw new Error(
      `fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
    )
  }

  // Get lmids for requesting client groups.
  const lastMutationIDChanges = await getLastMutationIDChanges(clientGroupID, fromVersion)

  // Get changed domain objects since requested version.
  const changedDomainObjects = await getChangedDomainObjects(fromVersion)

  // Build and return response.
  const patch = await getPatch(changedDomainObjects, fromVersion)

  const body: PullResponseV1 = {
    lastMutationIDChanges: lastMutationIDChanges ?? {},
    cookie: currentVersion,
    patch,
  }

  return body
}

export default processPull
