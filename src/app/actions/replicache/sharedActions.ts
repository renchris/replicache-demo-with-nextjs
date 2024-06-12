'use server'

import type { ClientGroupRecord } from '@replicache/types'
import {
  replicacheClientGroup,
} from 'drizzle/schema'
import { eq } from 'drizzle-orm'
import type { Transaction } from 'drizzle/db'

export async function putClientGroup(
  tx: Transaction,
  clientGroup: ClientGroupRecord,
): Promise<void> {
  const { id, cvrVersion, clientGroupVersion } = clientGroup
  const insertClientGroupStatementQuery = tx
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
  tx: Transaction,
  clientGroupID: string,
): Promise<Omit<ClientGroupRecord, 'id'>> {
  const clientGroupRowStatementQuery = tx
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
  tx: Transaction,
  clientGroupID: string,
): Promise<ClientGroupRecord> {
  const previousClientGroup = await getClientGroup(tx, clientGroupID)
  return {
    id: clientGroupID,
    clientGroupVersion: previousClientGroup.clientGroupVersion,
    cvrVersion: previousClientGroup.cvrVersion,
  }
}
