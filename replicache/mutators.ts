import { ReadTransaction, WriteTransaction } from 'replicache'
import { List, Share, Todo } from './types'

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

export type Mutators = {
  createList: (tx: WriteTransaction, list: List) => Promise<void>;
  deleteList: (tx: WriteTransaction, listID: string) => Promise<void>;
  createShare: (tx: WriteTransaction, share: Share) => Promise<void>;
  deleteShare: (tx: WriteTransaction, shareID: string) => Promise<void>;
  createTodo: (tx: WriteTransaction, todo: Todo) => Promise<void>;
  updateTodo: (tx: WriteTransaction, todoUpdate: Todo) => Promise<void>;
  deleteTodo: (tx: WriteTransaction, todoID: string) => Promise<void>;
}

const mutators = {
  createList: async (tx: WriteTransaction, list: List) => {
    await tx.put(`list/${list.id}`, list)
  },
  deleteList: async (tx: WriteTransaction, listID: string) => {
    await tx.del(`list/${listID}`)
  },
  createShare: async (tx: WriteTransaction, share: Share) => {
    await tx.put(`share/${share.id}`, share)
  },
  deleteShare: async (tx: WriteTransaction, shareID: string) => {
    await tx.del(`share/${shareID}`)
  },
  createTodo: async (tx: WriteTransaction, todo: Todo) => {
    const todos = await listTodos(tx)
    todos.sort((t1, t2) => t1.sort - t2.sort)
    const maxSort = todos.pop()?.sort ?? 0
    await tx.put(`todo/${todo.id}`, { ...todo, sort: maxSort + 1 })
  },
  updateTodo: async (tx: WriteTransaction, todoUpdate: Todo) => {
    const { id } = todoUpdate
    const previousTodo = await tx.get(`todo/${id}`) as Todo
    const nextTodo = { ...previousTodo, todoUpdate }
    await tx.put(`todo/${id}`, nextTodo)
  },
  deleteTodo: async (tx: WriteTransaction, todoID: string) => {
    await tx.del(`todo/${todoID}`)
  },
}

export default mutators