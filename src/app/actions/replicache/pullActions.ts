'use server'

import {
  eq, and, gt,
} from 'drizzle-orm'
import type {
  PatchOperation, PullRequestV1, PullResponseOKV1, PullResponseV1,
} from 'replicache'
import {
  replicacheClient,
} from 'drizzle/schema'
import getDB from 'drizzle/db'
import type {
  Cookie, ClientRecord, ClientViewRecord, List, SearchResult, Share, Todo,
} from '@replicache/types'
import { getClientGroupForUpdate, putClientGroup } from './sharedActions'
import {
  getTodos, getShares, getLists, getPutsSince, getDelsSince, searchLists, searchTodosAndShares,
} from './appActions'

// cvrKey -> ClientViewRecord
const cvrCache = new Map<string, ClientViewRecord>()

function makeCVRKey(clientGroupID: string, order: number) {
  return `${clientGroupID}/${order}`
}

function getBaseCVR(
  clientGroupID: string,
  cookie: Cookie,
) {
  let previousCVR: ClientViewRecord | undefined

  if (typeof cookie === 'object' && cookie !== null && typeof cookie.order === 'number') {
    previousCVR = cvrCache.get(makeCVRKey(clientGroupID, cookie.order))
  }

  const baseCVR = previousCVR ?? {
    list: new Map<string, number>(),
    todo: new Map<string, number>(),
    share: new Map<string, number>(),
    clientVersion: 0,
  }

  console.log({ previousCVR, baseCVR })

  return { previousCVR, baseCVR }
}

async function searchClients(clientGroupID: string, sinceClientVersion: number) {
  const db = await getDB()
  const clientRowStatementQuery = db
    .select({
      id: replicacheClient.id,
      lastMutationID: replicacheClient.lastMutationID,
      clientVersion: replicacheClient.clientVersion,
    })
    .from(replicacheClient)
    .where(and(
      eq(replicacheClient.clientGroupID, clientGroupID),
      gt(replicacheClient.clientVersion, sinceClientVersion),
    ))
    .prepare()

  const clientRows = await clientRowStatementQuery.all()

  const clients = clientRows.map((row) => {
    const client: ClientRecord = {
      id: row.id,
      clientGroupID,
      lastMutationID: row.lastMutationID,
      clientVersion: row.clientVersion,
    }
    return client
  })

  return clients
}

function fromSearchResult(result: SearchResult[]): Map<string, number> {
  const data = new Map<string, number>()
  result.forEach((row) => data.set(row.id, row.rowVersion))
  return data
}

async function pullForChanges(
  clientGroupID: string,
  baseCVR: ClientViewRecord,
  userID: string,
  cookie: Cookie,
): Promise<{
    nextCVRVersion: number;
    nextCVR: ClientViewRecord;
    clientChanges: ClientRecord[];
    lists: List[];
    shares: Share[];
    todos: Todo[];
  }> {
  const baseClientGroupRecord = await getClientGroupForUpdate(clientGroupID)
  const clientChanges = await searchClients(clientGroupID, baseCVR.clientVersion)
  const listMeta = await searchLists(userID)

  const listIDs = listMeta.map((listRow) => listRow.id)

  const { shareMeta, todoMeta } = await searchTodosAndShares(listIDs)

  const nextCVR: ClientViewRecord = {
    list: fromSearchResult(listMeta),
    todo: fromSearchResult(todoMeta),
    share: fromSearchResult(shareMeta),
    clientVersion: baseClientGroupRecord.clientGroupVersion,
  }

  const listPuts = await getPutsSince(nextCVR.list, baseCVR.list)
  const sharePuts = await getPutsSince(nextCVR.share, baseCVR.share)
  const todoPuts = await getPutsSince(nextCVR.todo, baseCVR.todo)

  let previousCVRVersion = baseClientGroupRecord.cvrVersion
  if (previousCVRVersion === null) {
    if (typeof cookie === 'object' && cookie !== null && typeof cookie.order === 'number') {
      previousCVRVersion = cookie.order
    } else {
      previousCVRVersion = 0
    }
    console.log(
      `ClientGroup ${clientGroupID} is new, initializing to ${previousCVRVersion}`,
    )
  }

  const nextClientGroupRecord = {
    ...baseClientGroupRecord,
    cvrVersion: previousCVRVersion + 1,
  }

  console.log({
    listPuts, sharePuts, todoPuts, nextClientGroupRecord,
  })

  const lists = await getLists(listPuts)
  const shares = await getShares(sharePuts)
  const todos = await getTodos(todoPuts)
  await putClientGroup(nextClientGroupRecord)

  return {
    nextCVRVersion: nextClientGroupRecord.cvrVersion,
    nextCVR,
    clientChanges,
    lists,
    shares,
    todos,
  }
}

function getPatch(
  previousCVR: ClientViewRecord | undefined,
  listDels: string[],
  lists: List[],
  shareDels: string[],
  shares: Share[],
  todoDels: string[],
  todos: Todo[],
): PatchOperation[] {
  const patch: PatchOperation[] = []

  if (previousCVR === undefined) {
    patch.push({ op: 'clear' })
  }

  listDels.forEach((id) => {
    patch.push({ op: 'del', key: `list/${id}` })
  })

  lists.forEach((listItem) => {
    patch.push({ op: 'put', key: `list/${listItem.id}`, value: listItem })
  })

  shareDels.forEach((id) => {
    patch.push({ op: 'del', key: `share/${id}` })
  })

  shares.forEach((shareItem) => {
    patch.push({ op: 'put', key: `share/${shareItem.id}`, value: shareItem })
  })

  todoDels.forEach((id) => {
    patch.push({ op: 'del', key: `todo/${id}` })
  })

  todos.forEach((todoItem) => {
    patch.push({ op: 'put', key: `todo/${todoItem.id}`, value: todoItem })
  })

  return patch
}

async function processPull(
  pull: PullRequestV1,
  userID: string,
): Promise<PullResponseV1> {
  const { clientGroupID, cookie } = pull
  const replicacheCookie = cookie as Cookie
  const { previousCVR, baseCVR } = getBaseCVR(clientGroupID, replicacheCookie)
  const db = await getDB()
  const {
    nextCVRVersion,
    nextCVR,
    clientChanges,
    lists,
    shares,
    todos,
  } = await db.transaction(async () => pullForChanges(
    clientGroupID,
    baseCVR,
    userID,
    replicacheCookie,
  ))

  const listDels = await getDelsSince(nextCVR.list, baseCVR.list)
  const shareDels = await getDelsSince(nextCVR.share, baseCVR.share)
  const todoDels = await getDelsSince(nextCVR.todo, baseCVR.todo)

  console.log({ listDels, shareDels, todoDels })

  const patch = getPatch(
    previousCVR,
    listDels,
    lists,
    shareDels,
    shares,
    todoDels,
    todos,
  )

  const responseCookie: Cookie = {
    clientGroupID,
    order: nextCVRVersion,
  }

  const body: PullResponseOKV1 = {
    cookie: responseCookie,
    lastMutationIDChanges: Object.fromEntries(
      clientChanges.map((clientRecord: ClientRecord):
      [string, number] => [clientRecord.id, clientRecord.lastMutationID]),
    ),
    patch,
  }

  cvrCache.set(makeCVRKey(responseCookie.clientGroupID, responseCookie.order), nextCVR)

  return body
}

export default processPull
