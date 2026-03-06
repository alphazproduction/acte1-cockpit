import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { fmt, type NiveauAlerte } from '@/lib/utils'

interface AlertBannerProps {
  niveau: NiveauAlerte
  projet: string
  montant: number
  message: string
  action: string
}

const CONFIG = {
  danger: {
    border: 'border-red/40',
    bg: 'bg-red/5',
    icon: AlertTriangle,
    iconColor: 'text-red',
    badge: 'bg-red/20 text-red',
    badgeLabel: 'DANGER',
  },
  warning: {
    border: 'border-orange/40',
    bg: 'bg-orange/5',
    icon: AlertCircle,
    iconColor: 'text-orange',
    badge: 'bg-orange/20 text-orange',
    badgeLabel: 'ATTENTION',
  },
  info: {
    border: 'border-blue/40',
    bg: 'bg-blue/5',
    icon: Info,
    iconColor: 'text-blue',
    badge: 'bg-blue/20 text-blue',
    badgeLabel: 'INFO',
  },
} as const

export default function AlertBanner({ niveau, projet, montant, message, action }: AlertBannerProps) {
  const c = CONFIG[niveau]
  const Icon = c.icon

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-4 flex items-start gap-3`}>
      <Icon className={`${c.iconColor} mt-0.5 shrink-0`} size={18} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${c.badge}`}>
            {c.badgeLabel}
          </span>
          <span className="font-sans text-sm font-medium text-text-main">{projet}</span>
          {montant > 0 && (
            <span className="font-mono text-xs text-text-muted">{fmt(montant)}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-text-muted">{message}</p>
        <p className="mt-1.5 text-xs font-mono text-gold">→ {action}</p>
      </div>
    </div>
  )
}
