'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface SourceTagProps {
  source: string
  detail?: string
}

export default function SourceTag({ source, detail }: SourceTagProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <Info size={12} />
        <span>Source : {source}</span>
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-1 left-0 w-72 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-xl">
          <p className="font-mono text-[11px] text-[var(--text-primary)] font-medium mb-1">Source de données</p>
          <p className="font-mono text-[10px] text-[var(--text-secondary)]">{source}</p>
          {detail && <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">{detail}</p>}
          <p className="font-mono text-[10px] text-[var(--accent)] mt-1.5">Fichier : Google Sheets ACTE 1 Cockpit</p>
        </div>
      )}
    </div>
  )
}
