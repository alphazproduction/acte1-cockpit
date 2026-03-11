'use client'

import { useState, useMemo } from 'react'
import { PROJETS } from '@/lib/data'
import { fmt, getStatut } from '@/lib/utils'
import { useSort } from '@/lib/useSort'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'
import SortHeader from '@/components/SortHeader'

interface PlanningRow {
  id: string
  code: string
  nom: string
  etat: string
  honoraires: number
  dateDebut: string
  dateFinInitiale: string
  dateFinRevisee: string
  delta: number
}

function computeDelta(initiale: string, revisee: string): number {
  if (!initiale || !revisee) return 0
  const init = new Date(initiale + '-01')
  const rev = new Date(revisee + '-01')
  return (rev.getFullYear() - init.getFullYear()) * 12 + (rev.getMonth() - init.getMonth())
}

export default function PlanningPage() {
  const initialData = useMemo<PlanningRow[]>(() => {
    return PROJETS
      .filter((p) => p.total_2026 > 0 || p.debut || p.fin_initiale || p.fin_revisee)
      .sort((a, b) => b.total_2026 - a.total_2026)
      .map((p) => ({
        id: p.id,
        code: p.code,
        nom: p.projet,
        etat: p.etat,
        honoraires: p.honoraire,
        dateDebut: p.debut ?? '',
        dateFinInitiale: p.fin_initiale ?? '',
        dateFinRevisee: p.fin_revisee ?? p.fin_initiale ?? '',
        delta: computeDelta(p.fin_initiale ?? '', p.fin_revisee ?? p.fin_initiale ?? ''),
      }))
  }, [])

  const [data, setData] = useState(initialData)
  const { sorted, sortKey, sortDir, requestSort } = useSort(data, 'honoraires', 'desc')

  const updateDate = (id: string, newDate: string) => {
    setData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const delta = computeDelta(p.dateFinInitiale, newDate)
        return { ...p, dateFinRevisee: newDate, delta }
      })
    )
  }

  return (
    <>
      <Topbar title="Planning projets" subtitle="Dates initiales vs révisées — impact trésorerie" />

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono text-xs">
                <SortHeader label="Code" sortKey="code" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-left px-4 py-3" />
                <SortHeader label="Projet" sortKey="nom" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-left px-4 py-3" />
                <SortHeader label="Statut" sortKey="etat" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-left px-4 py-3" />
                <SortHeader label="Honoraires" sortKey="honoraires" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-right px-4 py-3" />
                <SortHeader label="Début" sortKey="dateDebut" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-center px-4 py-3" />
                <SortHeader label="Fin initiale" sortKey="dateFinInitiale" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-center px-4 py-3" />
                <SortHeader label="Fin révisée" sortKey="dateFinRevisee" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-center px-4 py-3" />
                <SortHeader label="Delta" sortKey="delta" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className="text-center px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const statut = getStatut(p.etat)
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded">{p.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-sans text-[var(--text-primary)]">{p.nom}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${statut.color}`}>
                        {statut.icon} {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-[var(--text-primary)]">{fmt(p.honoraires)}</td>
                    <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{p.dateDebut || '—'}</td>
                    <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{p.dateFinInitiale || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="month"
                        value={p.dateFinRevisee}
                        onChange={(e) => updateDate(p.id, e.target.value)}
                        className="font-mono text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-center">
                      {p.delta === 0 ? (
                        <span className="text-[var(--text-secondary)]">&mdash;</span>
                      ) : p.delta > 0 ? (
                        <span className="text-[var(--danger)]">+{p.delta} mois</span>
                      ) : (
                        <span className="text-[var(--success)]">{p.delta} mois</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <SourceTag source="PHASES · dates début/fin prévues vs réelles" detail="La date fin révisée est modifiable. Le delta est calculé automatiquement en mois." />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-4">
        <p className="font-sans text-sm text-[var(--text-primary)]">
          <strong>Impact trésorerie :</strong> La modification des dates de fin révisées recalculera automatiquement la courbe de trésorerie prévisionnelle une fois connecté au Google Sheets.
        </p>
      </div>
    </>
  )
}
