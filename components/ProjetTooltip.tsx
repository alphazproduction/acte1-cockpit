'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { type Projet } from '@/lib/data'
import { fmt, fmtPct, getStatut, MOIS_COURANT_INDEX } from '@/lib/utils'
import SparkLine from './SparkLine'

interface ProjetTooltipProps {
  projet: Projet
}

export default function ProjetTooltip({ projet }: ProjetTooltipProps) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const statut = getStatut(projet.etat)
  const factureYTD = projet.mois.slice(0, MOIS_COURANT_INDEX + 1).reduce((a, b) => a + b, 0)
  const avancement = projet.total_2026 > 0 ? (factureYTD / projet.total_2026) * 100 : 0

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const tooltipW = 300
        const tooltipH = 260
        let left = rect.left
        let top = rect.bottom + 6

        // Empêcher le débordement à droite
        if (left + tooltipW > window.innerWidth - 16) {
          left = window.innerWidth - tooltipW - 16
        }
        // Empêcher le débordement en bas → afficher au-dessus
        if (top + tooltipH > window.innerHeight - 16) {
          top = rect.top - tooltipH - 6
        }

        setPos({ top, left })
      }
      setShow(true)
    }, 250)
  }, [])

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShow(false), 200)
  }, [])

  const tooltip = show && mounted ? createPortal(
    <div
      className="fixed z-[9999] w-[300px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded">{projet.code}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono ${statut.color}`}>
            {statut.icon} {statut.label}
          </span>
        </div>
        <p className="font-sans text-sm text-[var(--text-primary)] font-medium">{projet.projet}</p>
        <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5">{projet.etat}</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
        {[
          { label: 'Honoraires', value: fmt(projet.honoraire) },
          { label: 'Prévu 2026', value: fmt(projet.total_2026) },
          { label: 'Reste', value: fmt(projet.reste) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[var(--bg-card)] px-2 py-2 text-center">
            <p className="font-mono text-[8px] text-[var(--text-secondary)] uppercase">{kpi.label}</p>
            <p className="font-mono text-[11px] font-semibold text-[var(--text-primary)] mt-0.5">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[9px] text-[var(--text-secondary)]">Avancement 2026</span>
          <span className={`font-mono text-[10px] font-semibold ${avancement >= 100 ? 'text-[var(--success)]' : avancement >= 50 ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
            {fmtPct(avancement)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${avancement >= 100 ? 'bg-emerald-500' : avancement >= 50 ? 'bg-[var(--accent)]' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(avancement, 100)}%` }}
          />
        </div>
        <SparkLine data={projet.mois} />
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="inline-flex items-center gap-1.5" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span
        ref={triggerRef}
        className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded cursor-default shrink-0"
      >
        {projet.code}
      </span>
      <span className={`font-mono text-[9px] ${avancement >= 100 ? 'text-[var(--success)]' : avancement >= 50 ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}`}>
        {fmtPct(avancement)}
      </span>
      {tooltip}
    </div>
  )
}
