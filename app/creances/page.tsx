'use client'

import { fmt } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'

interface Creance {
  projet: string
  client: string
  montant: number
  dateEmission: string
  anciennete: number
  statut: 'En attente' | 'Relancé' | 'En retard' | 'Payé'
}

const CREANCES: Creance[] = [
  { projet: 'Manitou Suite', client: 'Manitou', montant: 30625, dateEmission: '2025-11-15', anciennete: 112, statut: 'En retard' },
  { projet: 'Cinéma Bobigny - Suite', client: 'Ville de Bobigny', montant: 12500, dateEmission: '2026-01-20', anciennete: 46, statut: 'Relancé' },
  { projet: 'Caudalie Base ERP', client: 'Caudalie', montant: 5775, dateEmission: '2026-02-10', anciennete: 25, statut: 'En attente' },
  { projet: "Musée de l'Armée - Phase 1", client: 'Musée de l\'Armée', montant: 8400, dateEmission: '2025-09-01', anciennete: 188, statut: 'En retard' },
  { projet: 'GoodLife 1', client: 'GoodLife', montant: 10925, dateEmission: '2026-01-31', anciennete: 35, statut: 'Relancé' },
]

const STATUT_STYLES: Record<Creance['statut'], string> = {
  'En attente': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  'Relancé': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  'En retard': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  'Payé': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
}

export default function CreancesPage() {
  const totalCreances = CREANCES.filter((c) => c.statut !== 'Payé').reduce((sum, c) => sum + c.montant, 0)
  const enRetard = CREANCES.filter((c) => c.statut === 'En retard')
  const totalRetard = enRetard.reduce((sum, c) => sum + c.montant, 0)

  return (
    <>
      <Topbar title="Créances" subtitle="Suivi des factures et recouvrement" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Créances en cours" value={fmt(totalCreances)} source="FACTURES · statut != Payé" accent="warning" />
        <KpiCard label="En retard (> 30j)" value={fmt(totalRetard)} source="FACTURES · ancienneté > 30 jours" accent="danger" />
        <KpiCard label="Factures en attente" value={String(CREANCES.filter((c) => c.statut !== 'Payé').length)} source="FACTURES · count" accent="info" />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono text-xs">
                <th className="text-left px-4 py-3">Projet</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-right px-4 py-3">Montant HT</th>
                <th className="text-center px-4 py-3">Date émission</th>
                <th className="text-center px-4 py-3">Ancienneté</th>
                <th className="text-center px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {CREANCES.map((c, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)]">
                  <td className="px-4 py-3 font-sans text-[var(--text-primary)]">{c.projet}</td>
                  <td className="px-4 py-3 font-sans text-[var(--text-secondary)]">{c.client}</td>
                  <td className="px-4 py-3 font-mono text-right text-[var(--text-primary)]">{fmt(c.montant)}</td>
                  <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{c.dateEmission}</td>
                  <td className={`px-4 py-3 font-mono text-center ${c.anciennete > 60 ? 'text-[var(--danger)]' : c.anciennete > 30 ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}`}>
                    {c.anciennete}j
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-mono ${STATUT_STYLES[c.statut]}`}>
                      {c.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <SourceTag source="FACTURES · toutes colonnes" detail="Données simulées pour le POC. Sera alimenté par l'onglet FACTURES du Google Sheets." />
        </div>
      </div>
    </>
  )
}
