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
  handleNewList,
  handleNewShare,
  handleUpdateTodo,
} from '@actions/replicache/todoActions'
import { TodoUpdate } from '@replicache/types'
import Header from './Header'
import MainSection from './MainSection'

const TodoApp = ({
  rep,
  userID,
  handleUserIDChange,
  children,
}: {
  rep: Replicache<Mutators> | null,
  userID: string,
  handleUserIDChange: (newUserID: string) => void,
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const listID = pathname.split('/').pop() || ''
  const selectedList = useSubscribe(
    rep,
    (tx: ReadTransaction) => getList(tx, listID),
    { default: undefined, dependencies: [listID] },
  )
  const todos = useSubscribe(
    rep,
    async (tx: ReadTransaction) => todosByList(tx, listID),
    { default: [], dependencies: [listID] },
  )
  const guests = useSubscribe(
    rep,
    async (tx: ReadTransaction) => {
      const allShares = await listShares(tx)
      return allShares.filter((share) => share.listID === listID)
    },
    { default: [], dependencies: [listID] },
  )
  todos.sort((a, b) => a.sort - b.sort)
  const [listName, setListName] = useState('')
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
  const handleDeleteItems = async (ids: string[]) => {
    if (ids) {
      await handleDeleteTodos(
        rep,
        ids,
      )
    }
  }
  const handleDeleteList = async () => {
    if (listID) {
      const todoIDs = todos.map((todo) => todo.id)
      await deleteList(
        rep,
        listID,
        todoIDs,
        router,
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
        handleUserIDChange={handleUserIDChange}
        guests={guests}
      />
      <MainSection
        todos={todos}
        selectedList={selectedList}
        deleteTodos={handleDeleteItems}
        updateTodo={handleUpdateItem}
      >
        {children}
      </MainSection>
    </div>
  )
}

export default TodoApp
