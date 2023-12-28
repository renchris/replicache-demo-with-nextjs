'use client'

import Link from 'next/link'
import { useSubscribe } from 'replicache-react'
import { type Mutators, listLists } from '@replicache/mutators'
import type { Replicache } from 'replicache'
import { css } from '@styled-system/css'

const DisplayLists = ({ rep }: { rep: Replicache<Mutators> | null }) => {
  const lists = useSubscribe(rep, listLists, [], [rep])
  return (
    <div>
      {lists.map((list) => (
        <Link
          key={list.id}
          href={`/list/${list.id}`}
          className={css({
            display: 'block',
            textAlign: 'right',
            marginBottom: '12px',
          })}
        >
          {list.name}
        </Link>
      ))}
    </div>
  )
}

export default DisplayLists
