'use server'

import type { ClientGroupRecord } from '@replicache/types'
import {
  replicacheClientGroup,
} from 'drizzle/schema'
import { eq } from 'drizzle-orm'
import db from 'drizzle/db'

export async function putClientGroup(
  clientGroup: ClientGroupRecord,
): Promise<void> {
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

  insertClientGroupStatementQuery.run()
}

function getClientGroup(
  clientGroupID: string,
): Omit<ClientGroupRecord, 'id'> {
  const clientGroupRowStatementQuery = db
    .select({
      cvrVersion: replicacheClientGroup.cvrVersion,
      clientGroupVersion: replicacheClientGroup.clientGroupVersion,
    })
    .from(replicacheClientGroup)
    .where(eq(replicacheClientGroup.id, clientGroupID))
    .prepare()

  const clientGroupRow = clientGroupRowStatementQuery.get() || {
    clientGroupVersion: 0,
    cvrVersion: null,
  }

  return clientGroupRow
}

export async function getClientGroupForUpdate(
  clientGroupID: string,
): Promise<ClientGroupRecord> {
  const previousClientGroup = getClientGroup(clientGroupID)
  return {
    id: clientGroupID,
    clientGroupVersion: previousClientGroup.clientGroupVersion,
    cvrVersion: previousClientGroup.cvrVersion,
  }
}
