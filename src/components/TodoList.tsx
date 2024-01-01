'use client'

import type { Todo, TodoUpdate } from '@replicache/types'
import TodoItem from './TodoItem'

const TodoList = (
  { todos, onUpdateTodo }: { todos: Todo[], onUpdateTodo:(update: TodoUpdate) => void; },
) => (
  <div>
    {todos.map((todo) => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onUpdate={(update) => onUpdateTodo(update)}
      />
    ))}
  </div>
)

export default TodoList
