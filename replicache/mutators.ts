import { ReadTransaction, WriteTransaction } from 'replicache'
import {
  List, Share, Todo, TodoUpdate,
} from './types'

export const getList = async (tx: ReadTransaction, listID: string) => {
  const list = await tx.get(`list/${listID}`)
  return list as List | undefined
}

export const listLists = async (tx: ReadTransaction) => {
  const lists = await tx
    .scan({
      prefix: 'list/',
      start: {
        key: 'list/',
      },
    })
    .values()
    .toArray()
  return lists as List[] | []
}

export const listShares = async (tx: ReadTransaction) => {
  const shares = await tx
    .scan({
      prefix: 'share/',
      start: {
        key: 'share/',
      },
    })
    .values()
    .toArray()
  return shares as Share[] | []
}

const listTodos = async (tx: ReadTransaction) => {
  const todos = await tx
    .scan({
      prefix: 'todo/',
      start: {
        key: 'todo/',
      },
    })
    .values()
    .toArray()
  return todos as Todo[] | []
}

export async function todosByList(tx: ReadTransaction, listID: string) {
  // TODO: would be better to use an index, but rails doesn't support yet.
  const allTodos = await listTodos(tx)
  return allTodos.filter((todo) => todo.listID === listID)
}

export type Mutators = {
  createList: (tx: WriteTransaction, list: List) => Promise<void>;
  deleteList: (tx: WriteTransaction, listID: string) => Promise<void>;
  createShare: (tx: WriteTransaction, share: Share) => Promise<void>;
  deleteShare: (tx: WriteTransaction, shareID: string) => Promise<void>;
  createTodo: (tx: WriteTransaction, todo: Omit<Todo, 'sort'>) => Promise<void>;
  updateTodo: (tx: WriteTransaction, todoUpdate: TodoUpdate) => Promise<void>;
  deleteTodo: (tx: WriteTransaction, todoID: string) => Promise<void>;
}

const mutators = {
  createList: async (tx: WriteTransaction, list: List) => {
    await tx.set(`list/${list.id}`, list)
  },
  deleteList: async (tx: WriteTransaction, listID: string) => {
    await tx.del(`list/${listID}`)
  },
  createShare: async (tx: WriteTransaction, share: Share) => {
    await tx.set(`share/${share.id}`, share)
  },
  deleteShare: async (tx: WriteTransaction, shareID: string) => {
    await tx.del(`share/${shareID}`)
  },
  createTodo: async (tx: WriteTransaction, todo: Omit<Todo, 'sort'>) => {
    const todos = await listTodos(tx)
    todos.sort((t1, t2) => t1.sort - t2.sort)
    const maxSort = todos.pop()?.sort ?? 0
    await tx.set(`todo/${todo.id}`, { ...todo, sort: maxSort + 1 })
  },
  updateTodo: async (tx: WriteTransaction, todoUpdate: TodoUpdate) => {
    const { id } = todoUpdate
    const previousTodo = await tx.get(`todo/${id}`) as Todo
    const nextTodo = { ...previousTodo, ...todoUpdate }
    await tx.set(`todo/${id}`, nextTodo)
  },
  deleteTodo: async (tx: WriteTransaction, todoID: string) => {
    await tx.del(`todo/${todoID}`)
  },
}

export default mutators
