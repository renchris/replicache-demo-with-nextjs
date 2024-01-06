'use client'

import type { Todo, TodoUpdate } from '@replicache/types'
import TodoItem from './TodoItem'

const TodoList = ({
  todos,
  onUpdateTodo,
  onDeleteTodo,
}: {
  todos: Todo[],
  onUpdateTodo:(update: TodoUpdate) => void,
  onDeleteTodo:(id: string) => void,
}) => (
  <div>
    {todos.map((todo) => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onUpdate={(update) => onUpdateTodo(update)}
        onDelete={() => onDeleteTodo(todo.id)}
      />
    ))}
  </div>
)

export default TodoList
