'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarRange, FolderKanban, PlusCircle } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forecast', label: 'Forecast', icon: CalendarRange },
  { href: '/projets', label: 'Projets', icon: FolderKanban },
  { href: '/nouveau', label: 'Nouveau', icon: PlusCircle },
] as const

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] flex-col border-r border-border-custom bg-bg-primary z-40">
        <div className="p-6">
          <h1 className="font-serif text-2xl text-gold tracking-tight">ACTE 1</h1>
          <p className="font-mono text-[10px] text-text-muted mt-1">Cockpit financier</p>
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
                    ? 'bg-bg-hover text-text-main'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-hover/50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border-custom">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            <span className="font-mono text-[10px] text-text-muted">Live · FORECAST 2026</span>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-custom z-40 flex justify-around py-2 px-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] font-mono transition-colors ${
                active ? 'text-gold' : 'text-text-muted'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
