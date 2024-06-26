// Define event handlers and connect them to Replicache mutators. Each
// of these mutators runs immediately (optimistically) locally, then runs

import type { Mutators } from '@replicache/mutators'
import type { TodoUpdate } from '@replicache/types'
import { nanoid } from 'nanoid'
import type { Replicache } from 'replicache'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// again on the server-side automatically.
export const handleNewItem = (
  rep: Replicache<Mutators> | null,
  listID: string,
  text: string,
) => {
  if (rep) {
    rep.mutate.createTodo({
      id: nanoid(),
      listID,
      text,
      complete: false,
    })
  }
}

export const handleUpdateTodo = async (
  rep: Replicache<Mutators> | null,
  update: TodoUpdate,
) => {
  if (rep) await rep.mutate.updateTodo(update)
}

export const handleDeleteTodos = async (
  rep: Replicache<Mutators> | null,
  ids: string[],
) => {
  if (rep) {
    ids.forEach(async (id) => {
      await rep.mutate.deleteTodo(id)
    })
  }
}

export const handleCompleteTodos = async (
  rep: Replicache<Mutators> | null,
  complete: boolean,
  ids: string[],
) => {
  if (rep) {
    ids.forEach(async (id) => {
      await rep.mutate.updateTodo({
        id,
        complete,
      })
    })
  }
}

export const handleNewList = async (
  rep: Replicache<Mutators> | null,
  userID: string,
  name: string,
  router: AppRouterInstance,
) => {
  if (rep) {
    const id = nanoid()
    await rep.mutate.createList({
      id,
      ownerID: userID,
      name,
    })
    router.push(`/list/${id}`)
  }
}

export const handleDeleteList = async (
  rep: Replicache<Mutators> | null,
  listID: string,
  todoIDs: string[],
  router: AppRouterInstance,
) => {
  if (rep) {
    await handleDeleteTodos(rep, todoIDs)
    await rep.mutate.deleteList(listID)
    router.push('/')
  }
}

export const handleNewShare = async (
  rep: Replicache<Mutators> | null,
  listID: string,
  userID: string,
) => {
  if (rep) {
    await rep.mutate.createShare({
      id: nanoid(),
      listID,
      userID,
    })
  }
}

export const handleDeleteShare = async (
  rep: Replicache<Mutators> | null,
  shareID: string,
) => {
  if (rep) {
    await rep.mutate.deleteShare(shareID)
  }
}
