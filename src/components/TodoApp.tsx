'use client'

import { useSubscribe } from 'replicache-react'
import { useRouter, usePathname } from 'next/navigation'
import type { ReadTransaction, Replicache } from 'replicache'
import { css } from '@styled-system/css'
import { type Mutators, getList, todosByList } from '@replicache/mutators'
import { useState } from 'react'
import { handleNewList } from '@app/todoActions'
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
  return (
    <div
      className={css({
        flex: 1,
        marginTop: '48px',
      })}
      id="todo-app"
    >
      <Header
        selectedList={selectedList}
        userID={userID}
        listName={listName}
        setListName={setListName}
        handleSubmitList={handleSubmitList}
      />
      <MainSection selectedList={selectedList}>
        Main Section Children
      </MainSection>
    </div>
  )
}

export default TodoApp
