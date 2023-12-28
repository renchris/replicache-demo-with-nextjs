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
      fontSize: '125%',
      paddingTop: '155px',
    })}
    id="navigation"
  >
    <DisplayLists rep={rep} />
  </div>
)

export default Lists
