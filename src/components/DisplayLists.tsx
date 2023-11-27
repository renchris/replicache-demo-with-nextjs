'use client'

import Link from 'next/link'
import { useSubscribe } from 'replicache-react'
import { getRowVersioningReplicache } from '@replicache/constructor'
import { listLists } from '@replicache/mutators'

const rep = getRowVersioningReplicache()

const DisplayLists = () => {
  const lists = useSubscribe(rep, listLists, [], [rep])
  return (
    <div>
      {lists.map((list) => (
        <Link key={list.id} href={`/list/${list.id}`}>
          {list.name}
        </Link>
      ))}
    </div>
  )
}
export default DisplayLists
