'use client'

import { X } from 'lucide-react'
import { type Projet } from '@/lib/data'
import { fmt, getStatut, MOIS_COURANT_INDEX } from '@/lib/utils'
import { MOIS_LABELS } from '@/lib/data'
import SparkLine from './SparkLine'

interface ProjetDetailProps {
  projet: Projet
  onClose: () => void
}

export default function ProjetDetail({ projet, onClose }: ProjetDetailProps) {
  const statut = getStatut(projet.etat)
  const factureYTD = projet.mois.slice(0, MOIS_COURANT_INDEX + 1).reduce((a, b) => a + b, 0)
  const resteAFacturer = projet.total_2026 - factureYTD

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold bg-[var(--accent)] text-white px-2 py-0.5 rounded">
                {projet.code}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${statut.color}`}>
                {statut.icon} {statut.label}
              </span>
            </div>
            <h3 className="font-serif text-lg text-[var(--text-primary)]">{projet.projet}</h3>
            <p className="font-mono text-xs text-[var(--text-secondary)] mt-0.5">{projet.etat}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
          {[
            { label: 'Honoraires', value: fmt(projet.honoraire) },
            { label: 'Facturé N-1', value: fmt(projet.facture_n1) },
            { label: 'Reste total', value: fmt(projet.reste) },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[var(--bg-card)] p-4 text-center">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">{kpi.label}</p>
              <p className="font-mono text-sm font-semibold text-[var(--text-primary)] mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
          {[
            { label: 'Prévu 2026', value: fmt(projet.total_2026) },
            { label: 'Facturé YTD', value: fmt(factureYTD) },
            { label: 'Reste 2026', value: fmt(resteAFacturer) },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[var(--bg-card)] p-4 text-center">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">{kpi.label}</p>
              <p className="font-mono text-sm font-semibold text-[var(--accent)] mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly breakdown */}
        <div className="p-5">
          <p className="font-mono text-xs text-[var(--text-secondary)] mb-3">Répartition mensuelle 2026</p>
          <div className="flex items-center gap-2 mb-3">
            <SparkLine data={projet.mois} />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {MOIS_LABELS.map((m, i) => (
              <div key={i} className={`text-center rounded p-1.5 ${i === MOIS_COURANT_INDEX ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]' : 'bg-[var(--bg-primary)]'}`}>
                <p className="font-mono text-[9px] text-[var(--text-secondary)]">{m}</p>
                <p className={`font-mono text-[11px] mt-0.5 ${projet.mois[i] > 0 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--border)]'}`}>
                  {projet.mois[i] > 0 ? `${Math.round(projet.mois[i] / 1000)}k` : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
