'use client'

import { css } from '@styled-system/css'
import type { Todo, TodoUpdate } from '@replicache/types'
import ItemCheckbox from './ItemCheckbox'

const TodoItem = (
  { todo, onUpdate }: { todo: Todo, onUpdate: (update: TodoUpdate) => void },
) => {
  const { id } = todo
  const handleToggleComplete = () => onUpdate({ id, complete: !todo.complete })
  return (
    <div className={css({
      display: 'flex',
      flexDir: 'row',
      paddingLeft: '24px',
      borderBottom: '1px solid #ededed',
    })}
    >
      <ItemCheckbox checked={todo.complete} onChange={handleToggleComplete} />
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
}

export default TodoItem
