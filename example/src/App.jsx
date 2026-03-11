import React, { useState } from 'react'
import { Counter } from './components/Counter'
import { Header } from './components/Header'

export function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <h1>Rspack DevTools Example</h1>
        <p>This is a demo application to test Rspack DevTools.</p>
        <Counter />
      </main>
    </div>
  )
}
