'use client'

import { useSubscribe } from 'replicache-react'
import { useParams } from 'next/navigation'
import type { ReadTransaction } from 'replicache'
import { css } from '@styled-system/css'
import { getRowVersioningReplicache } from '@replicache/constructor'
import { getList, listLists, todosByList } from '@replicache/mutators'
import Header from './Header'
import MainSection from './MainSection'

const rep = getRowVersioningReplicache()

const TodoApp = () => {
  const { listID = 'not found' } = useParams() as { [key: string]: string }
  const lists = useSubscribe(
    rep,
    listLists,
    [],
    [rep],
  )
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
  return (
    <div
      className={css({
        flex: 1,
        marginTop: '48px',
      })}
      id="todo-app"
    >
      <Header selectedList={selectedList} />
      <MainSection selectedList={selectedList}>
        Main Section Children
      </MainSection>
    </div>
  )
}

export default TodoApp
