'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { PROJETS, MOIS_LABELS } from '@/lib/data'
import { fmtK, fmtPct, getStatut, objectifMois, MOIS_COURANT_INDEX, PONDERATIONS } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'
import SparkLine from '@/components/SparkLine'
import ProjetTooltip from '@/components/ProjetTooltip'

export default function ForecastPage() {
  const [search, setSearch] = useState('')

  const projetsActifs = useMemo(() => {
    const list = PROJETS.filter((p) => p.total_2026 > 0).sort((a, b) => b.total_2026 - a.total_2026)
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((p) => p.projet.toLowerCase().includes(q) || p.etat.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
  }, [search])

  return (
    <>
      <Topbar title="Forecast détaillé" subtitle={`${projetsActifs.length} projets avec planification 2026`} />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
        <input
          type="text"
          placeholder="Rechercher par nom, code ou statut..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 font-sans text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono">
                <th className="text-left px-2 py-2.5 sticky left-0 bg-[var(--bg-card)] z-10 min-w-[90px]">Projet</th>
                {MOIS_LABELS.map((m, i) => (
                  <th key={i} className={`text-right px-2 py-2.5 min-w-[58px] ${i === MOIS_COURANT_INDEX ? 'text-[var(--accent)]' : ''}`}>
                    {m}
                    <br />
                    <span className="text-[9px] opacity-50">&times;{PONDERATIONS[i]}</span>
                  </th>
                ))}
                <th className="text-right px-2 py-2.5 min-w-[65px] text-[var(--accent)]">Total</th>
                <th className="text-center px-2 py-2.5 min-w-[50px]">12m</th>
              </tr>
            </thead>
            <tbody>
              {projetsActifs.map((p) => {
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)]">
                    <td className="px-2 py-1.5 sticky left-0 bg-[var(--bg-card)] z-10">
                      <ProjetTooltip projet={p} />
                    </td>
                    {p.mois.map((v, i) => {
                      const isPast = i < MOIS_COURANT_INDEX
                      const isCurrent = i === MOIS_COURANT_INDEX
                      let cellClass = 'text-[var(--text-secondary)]'
                      if (v > 0) {
                        if (isCurrent) cellClass = 'text-[var(--accent)] font-semibold'
                        else if (isPast) {
                          cellClass = 'text-[var(--text-secondary)] opacity-50'
                        } else {
                          cellClass = v >= 10000 ? 'text-[var(--accent)]' : 'text-[var(--success)]'
                        }
                      } else {
                        cellClass = 'text-[var(--border)]'
                      }
                      return (
                        <td key={i} className={`px-2 py-1.5 font-mono text-right ${cellClass}`}>
                          {v === 0 ? '—' : fmtK(v)}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1.5 font-mono text-right text-[var(--accent)] font-semibold">
                      {fmtK(p.total_2026)}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex justify-center">
                        <SparkLine data={p.mois} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border)] font-semibold">
                <td className="px-2 py-2.5 font-mono text-[var(--text-primary)] sticky left-0 bg-[var(--bg-card)] z-10">TOTAL</td>
                {MOIS_LABELS.map((_, i) => {
                  const total = projetsActifs.reduce((sum, p) => sum + p.mois[i], 0)
                  const obj = objectifMois(i)
                  const ratio = obj > 0 ? total / obj : 1
                  let colorClass = 'text-[var(--text-primary)]'
                  if (ratio >= 1) colorClass = 'text-[var(--success)]'
                  else if (ratio >= 0.8) colorClass = 'text-[var(--warning)]'
                  else if (total > 0) colorClass = 'text-[var(--danger)]'
                  return (
                    <td key={i} className={`px-2 py-2.5 font-mono text-right ${colorClass}`}>
                      {fmtK(total)}
                    </td>
                  )
                })}
                <td className="px-2 py-2.5 font-mono text-right text-[var(--accent)]">
                  {fmtK(projetsActifs.reduce((sum, p) => sum + p.total_2026, 0))}
                </td>
                <td />
              </tr>
              <tr className="text-[var(--text-secondary)]">
                <td className="px-2 py-1 font-mono text-[10px] italic sticky left-0 bg-[var(--bg-card)] z-10">Objectif</td>
                {MOIS_LABELS.map((_, i) => (
                  <td key={i} className="px-2 py-1 font-mono text-right text-[10px] italic">{fmtK(Math.round(objectifMois(i)))}</td>
                ))}
                <td className="px-2 py-1 font-mono text-right text-[10px] italic">{fmtK(400000)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <SourceTag source="PREVISIONNEL · toutes colonnes" detail="Survolez un trigramme pour voir le détail du projet. Couleurs : Vert ≥ objectif, Orange 80-100%, Rouge < 80%." />
        </div>
      </div>
    </>
  )
}
