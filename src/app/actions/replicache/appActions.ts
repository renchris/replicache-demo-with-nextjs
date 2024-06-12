'use server'

import type { Transaction } from 'drizzle/db'
import { item, list, share } from 'drizzle/schema'
import {
  and, eq, inArray, or, sql,
} from 'drizzle-orm'
import type { List, List as ReplicacheList, TodoUpdate } from 'replicache/types'
import type {
  Affected, Todo, Share, SearchResult,
} from '@replicache/types'
import { union, unionAll } from 'drizzle-orm/sqlite-core'

export async function getPutsSince(
  nextData: Map<string, number>,
  prevData: Map<string, number>,
): Promise<string[]> {
  const puts: string[] = []
  nextData.forEach((rowVersion, id) => {
    const prev = prevData.get(id)
    if (prev === undefined || prev < rowVersion) {
      puts.push(id)
    }
  })
  return puts
}

export async function getDelsSince(
  nextData: Map<string, number>,
  prevData: Map<string, number>,
): Promise<string[]> {
  const dels: string[] = []
  prevData.forEach((_, id) => {
    if (!nextData.has(id)) {
      dels.push(id)
    }
  })
  return dels
}

export async function getLists(tx: Transaction, listIDs: string[]): Promise<List[]> {
  if (listIDs.length === 0) return []
  const listStatemenetQuery = tx
    .select({
      id: list.id,
      name: list.name,
      ownerID: list.ownerID,
    })
    .from(list)
    .where(inArray(list.id, listIDs))
    .prepare()

  const listRows = await listStatemenetQuery.all()
  const lists = listRows.map((row) => {
    const listItem: List = {
      id: row.id,
      name: row.name,
      ownerID: row.ownerID,
    }
    return listItem
  })
  return lists
}

export async function createList(
  tx: Transaction,
  userID: string,
  listToInsert: ReplicacheList,
): Promise<{ listIDs: [], userIDs: string[] }> {
  if (userID !== listToInsert.ownerID) {
    throw new Error('Authorization error, cannot create list for other user')
  }
  const { id, ownerID, name } = listToInsert
  const insertListStatementQuery = tx
    .insert(list)
    .values({
      id,
      ownerID,
      name,
      rowVersion: 1,
      lastModified: new Date(),
    })
    .prepare()

  await insertListStatementQuery.run()

  return { listIDs: [], userIDs: [ownerID] }
}

export async function searchLists(
  tx: Transaction,
  accessibleByUserID: string,
): Promise<SearchResult[]> {
  const shareRowStatementSubquery = tx
    .select({
      id: share.listID,
    })
    .from(share)
    .where(eq(share.userID, accessibleByUserID))

  const listRowStatementQuery = tx
    .select({
      id: list.id,
      rowVersion: list.rowVersion,
    })
    .from(list)
    .where(
      or(
        eq(list.ownerID, accessibleByUserID),
        inArray(list.id, shareRowStatementSubquery),
      ),
    )
    .prepare()

  const listRows = await listRowStatementQuery.all()

  return listRows
}

export async function searchTodosAndShares(tx: Transaction, listIDs: string[]): Promise<{
  shareMeta: {
    id: string;
    rowVersion: number;
  }[];
  todoMeta: {
    id: string;
    rowVersion: number;
  }[];
}> {
  if (listIDs.length === 0) return { shareMeta: [], todoMeta: [] }
  const shareStatementQuery = tx
    .select({
      id: share.id,
      rowVersion: share.rowVersion,
      type: sql<string>`'shareMeta'`,
    })
    .from(share)
    .innerJoin(list, eq(share.listID, list.id))
    .where(inArray(list.id, listIDs))

  const todoStatementQuery = tx
    .select({
      id: item.id,
      rowVersion: item.rowVersion,
      type: sql<string>`'todoMeta'`,
    })
    .from(item)
    .where(inArray(item.listID, listIDs))

  const sharesAndTodos = await unionAll(
    shareStatementQuery,
    todoStatementQuery,
  )
    .prepare()
    .all()

  const result: {
    shareMeta: { id: string; rowVersion: number; }[],
    todoMeta: { id: string; rowVersion: number; }[] } = {
    shareMeta: [],
    todoMeta: [],
  }

  sharesAndTodos.forEach((row) => {
    const { id, rowVersion, type } = row
    result[type as 'shareMeta' | 'todoMeta'].push({ id, rowVersion })
  })

  return result
}

async function requireAccessToList(
  tx: Transaction,
  listID: string,
  accessingUserID: string,
) {
  const shareListIdSubquery = tx
    .select({ listID: share.listID })
    .from(share)
    .where(eq(share.userID, accessingUserID))

  const listRowStatementQuery = tx
    .select({ numberOfRows: sql<number>`count(*)` })
    .from(list)
    .where(
      and(
        eq(list.id, listID),
        or(
          eq(list.ownerID, accessingUserID),
          inArray(list.id, shareListIdSubquery),
        ),
      ),
    )
    .prepare()

  const [{ numberOfRows }] = await listRowStatementQuery.all()

  if (numberOfRows === 0) {
    throw new Error("Authorization error, can't access list")
  }
}

async function getAccessors(tx: Transaction, listID: string) {
  const ownerIDStatementQuery = tx
    .select({ userID: list.ownerID })
    .from(list)
    .where(eq(list.id, listID))

  const userIDStatementQuery = tx
    .select({ userID: share.userID })
    .from(share)
    .where(eq(share.listID, listID))

  const userIdRows = await union(ownerIDStatementQuery, userIDStatementQuery)
    .prepare()
    .all()

  return userIdRows.map((row: { userID: string }) => row.userID)
}

export async function deleteList(
  tx: Transaction,
  userID: string,
  listID: string,
): Promise<Affected> {
  await requireAccessToList(tx, listID, userID)
  const userIDs = await getAccessors(tx, listID)
  const deleteListStatementQuery = tx
    .delete(list)
    .where(eq(list.id, listID))
    .prepare()

  await deleteListStatementQuery.run()

  return {
    listIDs: [],
    userIDs,
  }
}

export async function createTodo(
  tx: Transaction,
  userID: string,
  todo: Omit<Todo, 'sort'>,
): Promise<{
    listIDs: string[];
    userIDs: [];
  }> {
  await requireAccessToList(tx, todo.listID, userID)
  const maxOrdRowStatementQuery = tx
    .select({ maxOrd: sql<number>`max(${item.ord})` })
    .from(item)
    .where(eq(item.listID, todo.listID))
    .prepare()

  const { maxOrd } = await maxOrdRowStatementQuery.get() || { maxOrd: 0 }

  const {
    id, listID, text, complete,
  } = todo

  const insertItemStatementQuery = tx
    .insert(item)
    .values({
      id,
      listID,
      title: text,
      complete,
      ord: maxOrd + 1,
      rowVersion: 1,
      lastModified: new Date(),
    })
    .prepare()

  await insertItemStatementQuery.run()

  return { listIDs: [todo.listID], userIDs: [] }
}

export async function createShare(
  tx: Transaction,
  userIDForAccess: string,
  shareToInsert: Share,
): Promise<{
    listIDs: string[];
    userIDs: string[];
  }> {
  await requireAccessToList(tx, shareToInsert.listID, userIDForAccess)
  const { id, listID, userID } = shareToInsert
  const insertShareStatementQuery = tx
    .insert(share)
    .values({
      id,
      listID,
      userID,
      rowVersion: 1,
      lastModified: new Date(),
    })
    .prepare()

  await insertShareStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [userID],
  }
}

export async function getShares(tx: Transaction, shareIDs: string[]): Promise<Share[]> {
  if (shareIDs.length === 0) return []
  const shareRowStatementQuery = tx
    .select({
      id: share.id,
      listID: share.listID,
      userID: share.userID,
    })
    .from(share)
    .where(inArray(share.id, shareIDs))
    .prepare()

  const shareRows = await shareRowStatementQuery.all()

  const shares = shareRows ? shareRows.map((row) => {
    const shareToGet: Share = {
      id: row.id,
      listID: row.listID,
      userID: row.userID,
    }
    return shareToGet
  }) : []
  return shares
}

export async function deleteShare(
  tx: Transaction,
  userIDForAccess: string,
  id: string,
): Promise<Affected> {
  const [shareToDelete] = await getShares(tx, [id])
  if (!shareToDelete) {
    throw new Error("Specified share doesn't exist")
  }

  const { listID, userID } = shareToDelete

  await requireAccessToList(tx, listID, userIDForAccess)
  const deleteShareQueryStatement = tx
    .delete(share)
    .where(eq(share.id, id))
    .prepare()

  await deleteShareQueryStatement.run()

  return {
    listIDs: [listID],
    userIDs: [userID],
  }
}

export async function getTodos(tx: Transaction, todoIDs: string[]): Promise<Todo[]> {
  if (todoIDs.length === 0) return []
  const todoRowStatementQuery = tx
    .select({
      id: item.id,
      listID: item.listID,
      title: item.title,
      complete: item.complete,
      ord: item.ord,
    })
    .from(item)
    .where(inArray(item.id, todoIDs))
    .prepare()

  const todoRows = await todoRowStatementQuery.all()

  const todos = todoRows.map((row) => {
    const todoToGet: Todo = {
      id: row.id,
      listID: row.listID,
      text: row.title,
      complete: row.complete,
      sort: row.ord,
    }
    return todoToGet
  })

  return todos
}

async function mustGetTodo(tx: Transaction, id: string): Promise<Todo> {
  const [todo] = await getTodos(tx, [id])
  if (!todo) {
    throw new Error('Specified todo does not exist')
  }
  return todo
}

export async function updateTodo(
  tx: Transaction,
  userID: string,
  todoToUpdate: TodoUpdate,
): Promise<Affected> {
  const { listID } = await mustGetTodo(tx, todoToUpdate.id)
  await requireAccessToList(tx, listID, userID)
  const {
    text = null, complete = null, sort = null, id,
  } = todoToUpdate

  const completeAsInteger = complete !== null ? Number(complete) : null

  const updateItemStatementQuery = tx
    .update(item)
    .set({
      title: sql<string>`coalesce(${text}, title)`,
      complete: sql<boolean>`coalesce(${completeAsInteger}, complete)`,
      ord: sql<number>`coalesce(${sort}, ord)`,
      rowVersion: sql<number>`row_version + 1`,
      lastModified: new Date(),
    })
    .where(eq(item.id, id))
    .prepare()

  await updateItemStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [],
  }
}

export async function deleteTodo(
  tx: Transaction,
  userID: string,
  todoID: string,
): Promise<Affected> {
  const { listID } = await mustGetTodo(tx, todoID)
  await requireAccessToList(tx, listID, userID)
  const deleteTodoStatementQuery = tx
    .delete(item)
    .where(eq(item.id, todoID))
    .prepare()

  await deleteTodoStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [],
  }
}
