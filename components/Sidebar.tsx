'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarRange, GanttChart, Receipt, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forecast', label: 'Forecast', icon: CalendarRange },
  { href: '/planning', label: 'Planning', icon: GanttChart },
  { href: '/creances', label: 'Créances', icon: Receipt },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
] as const

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] flex-col border-r border-[var(--border)] bg-[var(--bg-primary)] z-40">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[var(--accent)] tracking-tight">ACTE 1</h1>
            <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">Cockpit de pilotage</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans transition-colors ${
                  active
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">Live · Google Sheets</span>
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
