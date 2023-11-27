'use server'

import { css } from '@styled-system/css'
import DisplayLists from './DisplayLists'

const Lists = () => (
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
    <DisplayLists />
  </div>
)

export default Lists
