'use client'

import { css } from '@styled-system/css'
import type { List, Todo, TodoUpdate } from '@replicache/types'
import { useState } from 'react'
import TodoList from './TodoList'
import Footer from './Footer'

const MainSection = (
  {
    todos,
    selectedList,
    deleteTodos,
    updateTodo,
    children,
  }: {
    todos: Todo[],
    selectedList: List | undefined,
    deleteTodos: (ids: string[]) => void,
    updateTodo: (update: TodoUpdate) => void,
    children: React.ReactNode
  },
) => {
  const todosCount = todos.length
  const completed = todos.filter((todo) => todo.complete)
  const completedCount = completed.length
  // const toggleAllValue = completedCount === todosCount

  const [filter, setFilter] = useState('All')

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'All') {
      return true
    }
    if (filter === 'Active') {
      return !todo.complete
    }
    if (filter === 'Completed') {
      return todo.complete
    }
    throw new Error(`Unknown filter: ${filter}`)
  })

  return (
    <div
      className={css({
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.25)',
        marginTop: '12px',
      })}
    >
      {children}
      <TodoList
        todos={filteredTodos}
        onUpdateTodo={updateTodo}
        onDeleteTodo={(id) => deleteTodos([id])}
      />
      {selectedList && (
      <Footer
        completedCount={completedCount}
        activeCount={todosCount - completedCount}
        currentFilter={filter}
        onFilter={setFilter}
        deleteCompleted={() => deleteTodos(completed.map((todo) => todo.id))}
      />
      )}
    </div>
  )
}

export default MainSection
