import React from 'react'
import { Counter } from './components/Counter'
import { Header } from './components/Header'
import { TodoList } from './components/TodoList'
import { UserCard } from './components/UserCard'
import { DateDisplay } from './components/DateDisplay'
import { ThemeToggle } from './components/ThemeToggle'

export function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <h1>Rspack DevTools Example</h1>
        <p>This demo app showcases various features of Rspack DevTools.</p>
        <div className="grid">
          <Counter />
          <DateDisplay />
          <ThemeToggle />
        </div>
        <UserCard name="Developer" role="Engineer" />
        <TodoList />
      </main>
    </div>
  )
}
