'use client'

import { useState } from 'react'
import { STATS_GLOBALES, TOTAUX_MOIS_2026, type Projet } from '@/lib/data'
import { fmt, fmtPct, getAlertes, getTop5Projets, MOIS_COURANT_INDEX, OBJECTIF_ANNUEL, objectifCumule, tempsEcoulePondere } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'
import AlertBanner from '@/components/AlertBanner'
import BarChartMensuel from '@/components/BarChartMensuel'
import ChartYTD from '@/components/ChartYTD'
import ProjetDetail from '@/components/ProjetDetail'

export default function DashboardPage() {
  const [chartView, setChartView] = useState<'mensuel' | 'ytd'>('mensuel')
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const alertes = getAlertes()
  const top5 = getTop5Projets()

  const prevuCumule = TOTAUX_MOIS_2026.slice(0, MOIS_COURANT_INDEX + 1).reduce((a, b) => a + b.montant, 0)
  const objCumule = objectifCumule(MOIS_COURANT_INDEX)
  const tauxRealisation = objCumule > 0 ? (prevuCumule / objCumule) * 100 : 0
  const projection = Math.round((tauxRealisation / 100) * OBJECTIF_ANNUEL)
  const tempsEcoule = tempsEcoulePondere(MOIS_COURANT_INDEX)

  const ecart = tauxRealisation - tempsEcoule
  const ecartLabel = ecart >= 0
    ? `Vous \u00eates en avance de ${Math.round(ecart)} points`
    : `Vous \u00eates en retard de ${Math.round(Math.abs(ecart))} points`

  return (
    <>
      <Topbar title="Dashboard" subtitle="Vue synth\u00e9tique \u00b7 Cockpit de pilotage ACTE 1" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="CA pr\u00e9vu YTD" value={fmt(prevuCumule)} source="PREVISIONNEL \u00b7 cumul Jan\u2013Mar" accent="success" />
        <KpiCard label="Objectif YTD" value={fmt(Math.round(objCumule))} source="CONFIG \u00b7 objectif \u00d7 pond\u00e9ration cumul\u00e9e" accent="default" />
        <KpiCard label="Projection annuelle" value={fmt(projection)} source="Taux r\u00e9alisation \u00d7 objectif annuel" accent={projection >= OBJECTIF_ANNUEL * 0.8 ? 'warning' : 'danger'} />
        <KpiCard label="Reste \u00e0 facturer" value={fmt(STATS_GLOBALES.total_reste_facturer)} source="PROJETS \u00b7 col. honoraires_ht" accent="info" />
      </div>

      {/* Progression annuelle */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
        <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Progression annuelle</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Temps écoulé (pondéré)</span>
              <span className="font-mono text-xs text-[var(--accent)]">{fmtPct(tempsEcoule)}</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--accent)] opacity-30" style={{ width: `${Math.min(tempsEcoule, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Objectif prévu</span>
              <span className="font-mono text-xs text-[var(--success)]">{fmtPct(tauxRealisation)}</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className={`h-full rounded-full ${tauxRealisation >= 100 ? 'bg-emerald-500' : tauxRealisation >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(tauxRealisation, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-3 font-sans text-sm text-[var(--text-secondary)]">
          {ecartLabel}. Projection : <span className="font-mono text-[var(--accent)]">{fmt(projection)}</span> sur {fmt(OBJECTIF_ANNUEL)} ({fmtPct(projection / OBJECTIF_ANNUEL * 100)})
        </p>
        <SourceTag source="CONFIG \u00b7 objectif 400 000 \u20ac + pond\u00e9rations mensuelles" detail="Pond\u00e9ration : \u00d71 pour mois normaux, \u00d70.5 pour Jul/Ao\u00fb/D\u00e9c. Somme poids = 10.5" />
      </div>

      {/* Alertes */}
      <div className="mb-8">
        <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Alertes actives ({alertes.length})</h3>
        <div className="space-y-3">
          {alertes.map((a, i) => <AlertBanner key={i} {...a} />)}
        </div>
      </div>

      {/* Chart toggle */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-[var(--text-primary)]">Facturation 2026</h3>
          <div className="flex gap-1">
            {(['mensuel', 'ytd'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                  chartView === v
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {v === 'mensuel' ? 'Mensuel' : 'Consolidé'}
              </button>
            ))}
          </div>
        </div>
        {chartView === 'mensuel' ? <BarChartMensuel /> : <ChartYTD />}
      </div>

      {/* Top 5 */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Top 5 projets par CA restant</h3>
        <div className="space-y-3">
          {top5.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedProjet(p)}
                  className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded hover:opacity-80 transition-opacity shrink-0"
                  title={p.projet}
                >
                  {p.code}
                </button>
                <div className="min-w-0">
                  <p className="font-sans text-sm text-[var(--text-primary)] truncate">{p.projet}</p>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)]">{p.etat}</p>
                </div>
              </div>
              <p className="font-mono text-sm text-[var(--accent)] shrink-0 ml-4">{fmt(p.reste)}</p>
            </div>
          ))}
        </div>
        <SourceTag source="PROJETS \u00b7 col. honoraires_ht, tri\u00e9 d\u00e9croissant" />
      </div>

      {selectedProjet && <ProjetDetail projet={selectedProjet} onClose={() => setSelectedProjet(null)} />}
    </>
  )
}
