'use client'

import { css } from '@styled-system/css'
import type { Todo, TodoUpdate } from '@replicache/types'
import { useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import ItemCheckbox from './ItemCheckbox'
import { Button, ExitIcon } from './Button'
import ItemEditable from './ItemEditable'

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
  const handleSave = (text: string) => {
    if (text.length === 0) {
      onDelete()
    } else {
      onUpdate({ id, text })
    }
  }
  const [textInput, setTextInput] = useState(todo.text)
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value)
  }

  const handleSubmit = () => {
    handleSave(textInput)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }
  return (
    <div className={css({
      display: 'flex',
      flexDir: 'row',
      paddingX: '24px',
      boxSizing: 'border-box',
      border: isEditing ? 'solid 1px #b83f45' : 'solid 1px transparent',
      boxShadow: isEditing ? '0 0 0 1px #b83f45' : 'none',
      borderBottom: isEditing ? '1px solid #b83f45' : '1px solid #ededed',
    })}
    >
      <ItemCheckbox checked={todo.complete} onChange={handleToggleComplete} />
      <div
        className={css({
          padding: '15px 15px 15px 24px',
          fontSize: '24px',
          color: todo.complete ? '#949494' : '#484848',
          textDecoration: todo.complete ? 'line-through' : 'none',
          width: '100%',
        })}
      >
        <ItemEditable
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onValueRevert={() => {
            setTextInput(todo.text)
            setIsEditing(false)
          }}
          onValueCommit={() => {
            handleSave(textInput)
            setIsEditing(false)
          }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={textInput}
          submitMode="enter"

        />
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
