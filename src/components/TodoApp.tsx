'use client'

import { useSubscribe } from 'replicache-react'
import { useRouter, usePathname } from 'next/navigation'
import type { ReadTransaction, Replicache } from 'replicache'
import { css } from '@styled-system/css'
import {
  type Mutators, getList, todosByList, listShares,
} from '@replicache/mutators'
import { useState } from 'react'
import {
  handleDeleteList as deleteList,
  handleDeleteShare,
  handleDeleteTodos,
  handleNewItem,
  handleNewList,
  handleNewShare,
  handleUpdateTodo,
} from '@app/todoActions'
import { TodoUpdate } from '@replicache/types'
import Header from './Header'
import MainSection from './MainSection'

const TodoApp = ({ rep, userID }: { rep: Replicache<Mutators> | null, userID: string }) => {
  const pathname = usePathname()
  const listID = pathname.split('/').pop() || ''
  const selectedList = useSubscribe(
    rep,
    (tx: ReadTransaction) => getList(tx, listID),
    undefined,
    [rep, listID],
  )
  const todos = useSubscribe(
    rep,
    async (tx) => todosByList(tx, listID),
    [],
    [rep, listID],
  )
  const guests = useSubscribe(
    rep,
    async (tx) => {
      const allShares = await listShares(tx)
      return allShares.filter((share) => share.listID === listID)
    },
    [],
    [rep],
  )
  todos.sort((a, b) => a.sort - b.sort)
  const [listName, setListName] = useState('')
  const [itemName, setItemName] = useState('')
  const router = useRouter()
  const handleSubmitList = async () => {
    if (listName) {
      await handleNewList(
        rep,
        userID,
        listName,
        router,
      )
    }
    setListName('')
  }
  const handleDeleteList = async () => {
    if (listID) {
      await deleteList(
        rep,
        listID,
        router,
      )
    }
  }
  const handleSubmitItem = async (text: string) => {
    if (text) {
      await handleNewItem(
        rep,
        listID,
        text,
      )
    }
  }
  const handleDeleteItems = async (ids: string[]) => {
    if (ids) {
      await handleDeleteTodos(
        rep,
        ids,
      )
    }
  }
  const handleUpdateItem = async (update: TodoUpdate) => {
    await handleUpdateTodo(rep, update)
  }
  const handleSubmitCollaborator = async (sharedToUserID: string) => {
    if (sharedToUserID) {
      await handleNewShare(
        rep,
        listID,
        sharedToUserID,
      )
    }
  }

  const handleDeleteCollaborator = async (shareID: string) => {
    if (shareID) {
      await handleDeleteShare(
        rep,
        shareID,
      )
    }
  }
  return (
    <div
      className={css({
        flex: 1,
        marginY: '48px',
      })}
      id="todo-app"
    >
      <Header
        selectedList={selectedList}
        userID={userID}
        listName={listName}
        setListName={setListName}
        handleSubmitList={handleSubmitList}
        handleDeleteList={handleDeleteList}
        handleSubmitCollaborator={handleSubmitCollaborator}
        handleDeleteCollaborator={handleDeleteCollaborator}
        guests={guests}
      />
      <MainSection
        todos={todos}
        selectedList={selectedList}
        itemName={itemName}
        setItemName={setItemName}
        handleSubmitItem={handleSubmitItem}
        deleteTodos={handleDeleteItems}
        updateTodo={handleUpdateItem}
      />
    </div>
  )
}

export default TodoApp
