'use client'

import { css } from '@styled-system/css'
import type { Mutators } from '@replicache/mutators'
import type { Replicache } from 'replicache'
import DisplayLists from './DisplayLists'

const Lists = ({ rep }: { rep: Replicache<Mutators> | null }) => (
  <div
    className={css({
      display: 'flex',
      flexDir: 'column',
      width: '150px',
      paddingTop: '220px',
    })}
    id="navigation"
  >
    <DisplayLists rep={rep} />
  </div>
)

export default Lists
