'use client'

import { useState } from 'react'
import { PROJETS } from '@/lib/data'
import { fmt, getStatut } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'

interface PlanningProjet {
  id: string
  nom: string
  etat: string
  honoraires: number
  dateDebut: string
  dateFinInitiale: string
  dateFinRevisee: string
  delta: number
}

const PLANNING_DATA: PlanningProjet[] = [
  { id: 'palc-chalons', nom: 'PALC - Chalons - Moatti', etat: 'En cours', honoraires: 118750, dateDebut: '2025-06', dateFinInitiale: '2027-03', dateFinRevisee: '2027-03', delta: 0 },
  { id: 'roanne-dechelette', nom: 'Roanne - Musée Dechelette', etat: 'En cours', honoraires: 47851, dateDebut: '2025-09', dateFinInitiale: '2026-11', dateFinRevisee: '2026-11', delta: 0 },
  { id: 'rte-base-avenant', nom: 'RTE : Base et Avenant', etat: 'En cours', honoraires: 42000, dateDebut: '2026-01', dateFinInitiale: '2026-08', dateFinRevisee: '2026-08', delta: 0 },
  { id: 'airbus-b25', nom: 'AIRBUS - B25 - MOE', etat: 'En cours', honoraires: 69750, dateDebut: '2025-11', dateFinInitiale: '2026-05', dateFinRevisee: '2026-05', delta: 0 },
  { id: 'oradour', nom: "Centre de la Mémoire d'Oradour", etat: 'En cours', honoraires: 43650, dateDebut: '2025-03', dateFinInitiale: '2026-11', dateFinRevisee: '2026-11', delta: 0 },
  { id: 'nausicaa', nom: 'Nausicaa', etat: 'En cours', honoraires: 98766, dateDebut: '2024-06', dateFinInitiale: '2026-05', dateFinRevisee: '2026-05', delta: 0 },
  { id: 'cinema-bobigny', nom: 'Cinéma Bobigny - Suite', etat: 'En cours', honoraires: 93196, dateDebut: '2023-09', dateFinInitiale: '2026-04', dateFinRevisee: '2026-06', delta: 2 },
  { id: 'pb-museo', nom: 'Palais Bourbon Moatti - muséo', etat: 'Attente OS', honoraires: 136000, dateDebut: '2024-01', dateFinInitiale: '2026-06', dateFinRevisee: '2026-12', delta: 6 },
]

export default function PlanningPage() {
  const [data, setData] = useState(PLANNING_DATA)

  const updateDate = (id: string, newDate: string) => {
    setData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const init = new Date(p.dateFinInitiale + '-01')
        const rev = new Date(newDate + '-01')
        const deltaMonths = (rev.getFullYear() - init.getFullYear()) * 12 + (rev.getMonth() - init.getMonth())
        return { ...p, dateFinRevisee: newDate, delta: deltaMonths }
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
                <th className="text-left px-4 py-3">Projet</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Honoraires</th>
                <th className="text-center px-4 py-3">Début</th>
                <th className="text-center px-4 py-3">Fin initiale</th>
                <th className="text-center px-4 py-3">Fin révisée</th>
                <th className="text-center px-4 py-3">Delta</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => {
                const statut = getStatut(p.etat)
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3">
                      <p className="font-sans text-[var(--text-primary)]">{p.nom}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${statut.color}`}>
                        {statut.icon} {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-[var(--text-primary)]">{fmt(p.honoraires)}</td>
                    <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{p.dateDebut}</td>
                    <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{p.dateFinInitiale}</td>
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
