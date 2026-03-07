'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarRange, GanttChart, Receipt, Settings, HelpCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forecast', label: 'Forecast', icon: CalendarRange },
  { href: '/planning', label: 'Planning', icon: GanttChart },
  { href: '/creances', label: 'Créances', icon: Receipt },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
  { href: '/aide', label: 'Aide', icon: HelpCircle },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') {
      setCollapsed(true)
      document.documentElement.setAttribute('data-sidebar', 'collapsed')
    }
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    document.documentElement.setAttribute('data-sidebar', next ? 'collapsed' : 'expanded')
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <>
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen flex-col border-r border-[var(--border)] bg-[var(--bg-primary)] z-40 transition-[width] duration-200"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div>
              <h1 className="font-serif text-2xl text-[var(--accent)] tracking-tight">ACTE 1</h1>
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">Cockpit de pilotage</p>
            </div>
          )}
          {collapsed && <span className="font-serif text-lg text-[var(--accent)]">A1</span>}
        </div>
        <div className={`px-3 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center mb-2`}>
          {!collapsed && <ThemeToggle />}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
            title={collapsed ? 'Ouvrir sidebar' : 'Réduire sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>
        <div className={`p-4 border-t border-[var(--border)] ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            {!collapsed && <span className="font-mono text-[10px] text-[var(--text-secondary)]">POC · Données statiques</span>}
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border)] z-40 flex justify-around py-2 px-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-mono transition-colors ${
                active ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
