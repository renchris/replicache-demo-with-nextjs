'use server'

import type { ClientGroupRecord } from '@replicache/types'
import {
  replicacheClientGroup,
} from 'drizzle/schema'
import { eq } from 'drizzle-orm'
import getDB from 'drizzle/db'

export async function putClientGroup(
  clientGroup: ClientGroupRecord,
): Promise<void> {
  const db = await getDB()
  const { id, cvrVersion, clientGroupVersion } = clientGroup
  const insertClientGroupStatementQuery = db
    .insert(replicacheClientGroup)
    .values({
      id,
      cvrVersion,
      clientGroupVersion,
      lastModified: new Date(),
    })
    .onConflictDoUpdate({
      target: replicacheClientGroup.id,
      set: {
        cvrVersion,
        clientGroupVersion,
        lastModified: new Date(),
      },
    })
    .prepare()

  await insertClientGroupStatementQuery.run()
}

async function getClientGroup(
  clientGroupID: string,
): Promise<Omit<ClientGroupRecord, 'id'>> {
  const db = await getDB()
  const clientGroupRowStatementQuery = db
    .select({
      cvrVersion: replicacheClientGroup.cvrVersion,
      clientGroupVersion: replicacheClientGroup.clientGroupVersion,
    })
    .from(replicacheClientGroup)
    .where(eq(replicacheClientGroup.id, clientGroupID))
    .prepare()

  const clientGroupRow = await clientGroupRowStatementQuery.get() || {
    clientGroupVersion: 0,
    cvrVersion: null,
  }

  return clientGroupRow
}

export async function getClientGroupForUpdate(
  clientGroupID: string,
): Promise<ClientGroupRecord> {
  const previousClientGroup = await getClientGroup(clientGroupID)
  return {
    id: clientGroupID,
    clientGroupVersion: previousClientGroup.clientGroupVersion,
    cvrVersion: previousClientGroup.cvrVersion,
  }
}
