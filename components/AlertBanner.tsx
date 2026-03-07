'use client'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { fmt, type NiveauAlerte } from '@/lib/utils'
import SourceTag from './SourceTag'

interface AlertBannerProps {
  niveau: NiveauAlerte
  projet: string
  montant: number
  message: string
  action: string
  source: string
}

const CONFIG = {
  danger: { icon: AlertTriangle, iconColor: 'text-[var(--danger)]', border: 'border-red-300 dark:border-red-500/40', bg: 'bg-red-50 dark:bg-red-500/5', badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', badgeLabel: 'DANGER' },
  warning: { icon: AlertCircle, iconColor: 'text-[var(--warning)]', border: 'border-amber-300 dark:border-amber-500/40', bg: 'bg-amber-50 dark:bg-amber-500/5', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', badgeLabel: 'ATTENTION' },
  info: { icon: Info, iconColor: 'text-[var(--info)]', border: 'border-blue-300 dark:border-blue-500/40', bg: 'bg-blue-50 dark:bg-blue-500/5', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', badgeLabel: 'INFO' },
} as const

export default function AlertBanner({ niveau, projet, montant, message, action, source }: AlertBannerProps) {
  const c = CONFIG[niveau]
  const Icon = c.icon

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-4 flex items-start gap-3`}>
      <Icon className={`${c.iconColor} mt-0.5 shrink-0`} size={18} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${c.badge}`}>{c.badgeLabel}</span>
          <span className="font-sans text-sm font-medium text-[var(--text-primary)]">{projet}</span>
          {montant > 0 && <span className="font-mono text-xs text-[var(--text-secondary)]">{fmt(montant)}</span>}
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
        <p className="mt-1.5 text-xs font-mono text-[var(--accent)]">&rarr; {action}</p>
        <SourceTag source={source} />
      </div>
    </div>
  )
}
