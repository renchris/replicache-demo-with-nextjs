import db from 'db'
import { item, list, share } from 'drizzle/schema'
import {
  and, eq, inArray, or, sql,
} from 'drizzle-orm'
import type { List, List as ReplicacheList, TodoUpdate } from 'replicache/types'
import type {
  Affected, Todo, Share, SearchResult,
} from '@replicache/types'
import { union, unionAll } from 'drizzle-orm/sqlite-core'

export function getPutsSince(
  nextData: Map<string, number>,
  prevData: Map<string, number>,
): string[] {
  const puts: string[] = []
  nextData.forEach((rowVersion, id) => {
    const prev = prevData.get(id)
    if (prev === undefined || prev < rowVersion) {
      puts.push(id)
    }
  })
  return puts
}

export function getDelsSince(
  nextData: Map<string, number>,
  prevData: Map<string, number>,
): string[] {
  const dels: string[] = []
  prevData.forEach((_, id) => {
    if (!nextData.has(id)) {
      dels.push(id)
    }
  })
  return dels
}

export function getLists(listIDs: string[]) {
  if (listIDs.length === 0) return []
  const listStatemenetQuery = db
    .select({
      id: list.id,
      name: list.name,
      ownerID: list.ownerID,
    })
    .from(list)
    .where(inArray(list.id, listIDs))
    .prepare()

  const listRows = listStatemenetQuery.all()
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

export type ListAndID = {
  id: string,
  name: string;
  ownerID: string;
  rowVersion: number;
  lastModified: number;
}

export function createList(
  userID: string,
  listToInsert: ReplicacheList,
) {
  if (userID !== listToInsert.ownerID) {
    throw new Error('Authorization error, cannot create list for other user')
  }
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

  insertListStatementQuery.run()

  return { listIDs: [], userIDs: [ownerID] }
}

export function searchLists(
  accessibleByUserID: string,
): SearchResult[] {
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

  const listRows = listRowStatementQuery.all()

  return listRows
}

export function searchTodosAndShares(listIDs: string[]) {
  if (listIDs.length === 0) return { shareMeta: [], todoMeta: [] }

  const shareStatementQuery = db
    .select({
      id: share.id,
      rowVersion: share.rowVersion,
      type: sql<string>`'share'`,
    })
    .from(share)
    .innerJoin(list, eq(share.listID, list.id))
    .where(inArray(list.id, listIDs))

  const todoStatementQuery = db
    .select({
      id: item.id,
      rowVersion: item.rowVersion,
      type: sql<string>`'todo'`,
    })
    .from(item)
    .where(inArray(item.listID, listIDs))

  const sharesAndTodos = unionAll(
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

function requireAccessToList(
  listID: string,
  accessingUserID: string,
) {
  const shareListIdSubquery = db
    .select({ listID: share.listID })
    .from(share)
    .where(eq(share.userID, accessingUserID))

  const listRowStatementQuery = db
    .select({ count: sql<number>`count(*)` })
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

  const numberOfRows = listRowStatementQuery.all()

  if (numberOfRows.length === 0) {
    throw new Error("Authorization error, can't access list")
  }
}

function getAccessors(listID: string) {
  const ownerIDStatementQuery = db
    .select({ userID: list.ownerID })
    .from(list)
    .where(eq(list.id, listID))

  const userIDStatementQuery = db
    .select({ userID: share.userID })
    .from(share)
    .where(eq(share.listID, listID))

  const userIdRows = union(ownerIDStatementQuery, userIDStatementQuery)
    .prepare()
    .all()

  return userIdRows.map((row: { userID: string }) => row.userID)
}

export function deleteList(
  userID: string,
  listID: string,
): Affected {
  requireAccessToList(listID, userID)
  const userIDs = getAccessors(listID)
  const deleteListStatementQuery = db
    .delete(list)
    .where(eq(list.id, listID))
    .prepare()

  deleteListStatementQuery.run()

  return {
    listIDs: [],
    userIDs,
  }
}

export function createTodo(
  userID: string,
  todo: Omit<Todo, 'sort'>,
) {
  requireAccessToList(todo.listID, userID)
  const maxOrdRowStatementQuery = db
    .select({ maxOrd: sql<number>`max(${item.ord})` })
    .from(item)
    .where(eq(item.listID, todo.listID))
    .prepare()

  const { maxOrd } = maxOrdRowStatementQuery.get() || { maxOrd: 0 }

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

  insertItemStatementQuery.run()

  return { listIDs: [todo.listID], userIDs: [] }
}

export function createShare(
  userIDForAccess: string,
  shareToInsert: Share,
) {
  requireAccessToList(shareToInsert.listID, userIDForAccess)
  const { id, listID, userID } = shareToInsert
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

  insertShareStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [userID],
  }
}

export function getShares(shareIDs: string[]) {
  if (shareIDs.length === 0) return []

  const shareRowStatementQuery = db
    .select({
      id: share.id,
      listID: share.listID,
      userID: share.userID,
    })
    .from(share)
    .where(inArray(share.id, shareIDs))
    .prepare()

  const shareRows = shareRowStatementQuery.all()

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

export function deleteShare(
  userIDForAccess: string,
  id: string,
): Affected {
  const [shareToDelete] = getShares([id])
  if (!shareToDelete) {
    throw new Error("Specified share doesn't exist")
  }

  const { listID, userID } = shareToDelete

  requireAccessToList(listID, userIDForAccess)
  const deleteShareQueryStatement = db
    .delete(share)
    .where(eq(share.id, id))
    .prepare()

  deleteShareQueryStatement.run()

  return {
    listIDs: [listID],
    userIDs: [userID],
  }
}

export function getTodos(todoIDs: string[]) {
  if (todoIDs.length === 0) return []
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

  const todoRows = todoRowStatementQuery.all()

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

function mustGetTodo(id: string): Todo {
  const [todo] = getTodos([id])
  if (!todo) {
    throw new Error('Specified todo does not exist')
  }
  return todo
}

export function updateTodo(
  userID: string,
  todoToUpdate: TodoUpdate,
): Affected {
  const { listID } = mustGetTodo(todoToUpdate.id)
  requireAccessToList(listID, userID)
  const {
    text = null, complete = null, sort = null, id,
  } = todoToUpdate

  const completeAsInteger = complete ? Number(complete) : null

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

  updateItemStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [],
  }
}

export function deleteTodo(
  userID: string,
  todoID: string,
): Affected {
  const { listID } = mustGetTodo(todoID)
  requireAccessToList(listID, userID)
  const deleteTodoStatementQuery = db
    .delete(item)
    .where(eq(item.id, todoID))
    .prepare()

  deleteTodoStatementQuery.run()

  return {
    listIDs: [listID],
    userIDs: [],
  }
}
