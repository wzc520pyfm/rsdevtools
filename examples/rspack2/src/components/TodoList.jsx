import React from 'react'
import { create } from 'zustand'
import clsx from 'clsx'

const useTodoStore = create((set) => ({
  todos: [
    { id: 1, text: 'Learn Rspack', done: true },
    { id: 2, text: 'Build DevTools', done: false },
    { id: 3, text: 'Ship it!', done: false },
  ],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }],
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
  })),
}))

export function TodoList() {
  const { todos, addTodo, toggleTodo } = useTodoStore()
  const [text, setText] = React.useState('')

  const handleAdd = () => {
    if (text.trim()) { addTodo(text.trim()); setText('') }
  }

  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      <div className="todo-input">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add todo..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={clsx('todo-item', { done: todo.done })}
            onClick={() => toggleTodo(todo.id)}>
            <span className="checkbox">{todo.done ? '\u2713' : '\u25CB'}</span>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
