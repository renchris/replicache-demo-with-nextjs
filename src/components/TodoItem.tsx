'use client'

import { css } from '@styled-system/css'
import type { Todo, TodoUpdate } from '@replicache/types'
import ItemCheckbox from './ItemCheckbox'
import { Button, ExitIcon } from './Button'

const TodoItem = ({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo,
  onUpdate: (update: TodoUpdate) => void,
  onDelete: () => void,
}) => {
  const { id } = todo
  const handleToggleComplete = () => onUpdate({ id, complete: !todo.complete })
  return (
    <div className={css({
      display: 'flex',
      flexDir: 'row',
      paddingX: '24px',
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
      <Button
        variant="ghost"
        marginY="auto"
        marginLeft="auto"
        height="20px"
        width="20px"
        minWidth="20px"
        padding="2px"
        borderRadius="2px"
        onClick={() => onDelete()}
      >
        <ExitIcon />
      </Button>
    </div>
  )
}

export default TodoItem
