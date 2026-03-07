'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[var(--text-secondary)]" />}
    </button>
  )
}
