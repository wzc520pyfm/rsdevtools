import React from 'react'
import { create } from 'zustand'
import clsx from 'clsx'

const useThemeStore = create((set) => ({
  theme: 'light',
  toggle: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore()

  return (
    <div className="card">
      <h3>Theme</h3>
      <button className={clsx('theme-btn', theme)} onClick={toggle}>
        {theme === 'light' ? '\u2600\uFE0F Light' : '\u{1F319} Dark'}
      </button>
    </div>
  )
}
