'use client'

import { TOTAUX_MOIS_2026 } from '@/lib/data'
import { fmt, MOIS_COURANT_INDEX } from '@/lib/utils'

interface MonthGridProps {
  selected: number | null
  onSelect: (index: number) => void
}

export default function MonthGrid({ selected, onSelect }: MonthGridProps) {
  const max = Math.max(...TOTAUX_MOIS_2026.map((m) => m.montant), 1)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {TOTAUX_MOIS_2026.map((m, i) => {
        const isCourant = i === MOIS_COURANT_INDEX
        const isCreux = m.montant === 0
        const isSelected = selected === i

        let borderClass = 'border-border-custom'
        if (isSelected) borderClass = 'border-gold'
        else if (isCourant) borderClass = 'border-blue/60'
        else if (isCreux) borderClass = 'border-red/40'

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`rounded-lg border ${borderClass} bg-bg-card p-4 text-left transition-colors hover:bg-bg-hover cursor-pointer`}
          >
            <p className="font-mono text-xs text-text-muted uppercase tracking-wider">
              {m.mois}
              {isCourant && (
                <span className="ml-1.5 text-[9px] text-blue font-bold">COURANT</span>
              )}
              {isCreux && (
                <span className="ml-1.5 text-[9px] text-red font-bold">CREUX</span>
              )}
            </p>
            <p className={`mt-1.5 font-mono text-lg font-semibold ${
              m.montant === 0 ? 'text-text-muted' : 'text-gold'
            }`}>
              {fmt(m.montant)}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-border-custom overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isCourant ? 'bg-blue' : m.montant === 0 ? 'bg-transparent' : 'bg-gold/60'
                }`}
                style={{ width: `${(m.montant / max) * 100}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
