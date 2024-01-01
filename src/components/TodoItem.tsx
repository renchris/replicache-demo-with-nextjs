'use client'

import { css } from '@styled-system/css'
import type { Todo } from '@replicache/types'
import ItemCheckbox from './ItemCheckbox'

const TodoItem = (
  { todo }: { todo: Todo },
) => (
  <div className={css({
    display: 'flex',
    flexDir: 'row',
    paddingLeft: '24px',
    borderBottom: '1px solid #ededed',
  })}
  >
    <ItemCheckbox />
    <div
      className={css({
        padding: '15px 15px 15px 24px',
        fontSize: '24px',

        color: todo.complete ? '#949494' : '#484848',
        textDecoration: todo.complete ? 'line-through' : 'none',
      })}
    >
      {todo.text}
    </div>
  </div>
)

export default TodoItem
