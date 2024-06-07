'use server'

import getDB from 'drizzle/db'
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

export async function getLists(listIDs: string[]): Promise<List[]> {
  if (listIDs.length === 0) return []
  const db = await getDB()
  const listStatemenetQuery = db
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
  userID: string,
  listToInsert: ReplicacheList,
): Promise<{ listIDs: [], userIDs: string[] }> {
  if (userID !== listToInsert.ownerID) {
    throw new Error('Authorization error, cannot create list for other user')
  }
  const db = await getDB()
  const { id, ownerID, name } = listToInsert
  const insertListStatementQuery = db
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
  accessibleByUserID: string,
): Promise<SearchResult[]> {
  const db = await getDB()
  const shareRowStatementSubquery = db
    .select({
      id: share.listID,
    })
    .from(share)
    .where(eq(share.userID, accessibleByUserID))

  const listRowStatementQuery = db
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

export async function searchTodosAndShares(listIDs: string[]): Promise<{
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
  const db = await getDB()
  const shareStatementQuery = db
    .select({
      id: share.id,
      rowVersion: share.rowVersion,
      type: sql<string>`'shareMeta'`,
    })
    .from(share)
    .innerJoin(list, eq(share.listID, list.id))
    .where(inArray(list.id, listIDs))

  const todoStatementQuery = db
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
  listID: string,
  accessingUserID: string,
) {
  const db = await getDB()
  const shareListIdSubquery = db
    .select({ listID: share.listID })
    .from(share)
    .where(eq(share.userID, accessingUserID))

  const listRowStatementQuery = db
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

async function getAccessors(listID: string) {
  const db = await getDB()
  const ownerIDStatementQuery = db
    .select({ userID: list.ownerID })
    .from(list)
    .where(eq(list.id, listID))

  const userIDStatementQuery = db
    .select({ userID: share.userID })
    .from(share)
    .where(eq(share.listID, listID))

  const userIdRows = await union(ownerIDStatementQuery, userIDStatementQuery)
    .prepare()
    .all()

  return userIdRows.map((row: { userID: string }) => row.userID)
}

export async function deleteList(
  userID: string,
  listID: string,
): Promise<Affected> {
  await requireAccessToList(listID, userID)
  const db = await getDB()
  const userIDs = await getAccessors(listID)
  const deleteListStatementQuery = db
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
  userID: string,
  todo: Omit<Todo, 'sort'>,
): Promise<{
    listIDs: string[];
    userIDs: [];
  }> {
  await requireAccessToList(todo.listID, userID)
  const db = await getDB()
  const maxOrdRowStatementQuery = db
    .select({ maxOrd: sql<number>`max(${item.ord})` })
    .from(item)
    .where(eq(item.listID, todo.listID))
    .prepare()

  const { maxOrd } = await maxOrdRowStatementQuery.get() || { maxOrd: 0 }

  const {
    id, listID, text, complete,
  } = todo

  const insertItemStatementQuery = db
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
  userIDForAccess: string,
  shareToInsert: Share,
): Promise<{
    listIDs: string[];
    userIDs: string[];
  }> {
  await requireAccessToList(shareToInsert.listID, userIDForAccess)
  const { id, listID, userID } = shareToInsert
  const db = await getDB()
  const insertShareStatementQuery = db
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

export async function getShares(shareIDs: string[]): Promise<Share[]> {
  if (shareIDs.length === 0) return []

  const db = await getDB()
  const shareRowStatementQuery = db
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
  userIDForAccess: string,
  id: string,
): Promise<Affected> {
  const [shareToDelete] = await getShares([id])
  if (!shareToDelete) {
    throw new Error("Specified share doesn't exist")
  }

  const { listID, userID } = shareToDelete

  await requireAccessToList(listID, userIDForAccess)
  const db = await getDB()
  const deleteShareQueryStatement = db
    .delete(share)
    .where(eq(share.id, id))
    .prepare()

  await deleteShareQueryStatement.run()

  return {
    listIDs: [listID],
    userIDs: [userID],
  }
}

export async function getTodos(todoIDs: string[]): Promise<Todo[]> {
  if (todoIDs.length === 0) return []
  const db = await getDB()
  const todoRowStatementQuery = db
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

async function mustGetTodo(id: string): Promise<Todo> {
  const [todo] = await getTodos([id])
  if (!todo) {
    throw new Error('Specified todo does not exist')
  }
  return todo
}

export async function updateTodo(
  userID: string,
  todoToUpdate: TodoUpdate,
): Promise<Affected> {
  const { listID } = await mustGetTodo(todoToUpdate.id)
  await requireAccessToList(listID, userID)
  const {
    text = null, complete = null, sort = null, id,
  } = todoToUpdate

  const completeAsInteger = complete !== null ? Number(complete) : null

  const db = await getDB()
  const updateItemStatementQuery = db
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
  userID: string,
  todoID: string,
): Promise<Affected> {
  const { listID } = await mustGetTodo(todoID)
  await requireAccessToList(listID, userID)
  const db = await getDB()
  const deleteTodoStatementQuery = db
    .delete(item)
    .where(eq(item.id, todoID))
    .prepare()

  await deleteTodoStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [],
  }
}
