'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { PROJETS, TOTAUX_MOIS_2026, type Projet } from '@/lib/data'
import { fmt, fmtK, fmtPct, getAlertes, getTop5Projets, MOIS_COURANT_INDEX, OBJECTIF_ANNUEL, objectifCumule, tempsEcoulePondere } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'
import AlertBanner from '@/components/AlertBanner'
import BarChartMensuel from '@/components/BarChartMensuel'
import ChartYTD from '@/components/ChartYTD'
import ProjetDetail from '@/components/ProjetDetail'

function InfoBulle({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-secondary)] transition-colors"
        title="En savoir plus"
      >
        <Info size={10} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-6 top-0 z-50 w-72 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-xl p-3">
            <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">{text}</p>
          </div>
        </>
      )}
    </span>
  )
}

export default function DashboardPage() {
  const [chartView, setChartView] = useState<'mensuel' | 'ytd'>('mensuel')
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const alertes = getAlertes()
  const top5 = getTop5Projets()

  // Reste à facturer = somme des restes des projets avec honoraires > 0 (exclut pipeline/propositions)
  const resteFacturer = PROJETS
    .filter((p) => p.honoraire > 0)
    .reduce((sum, p) => sum + p.reste, 0)

  const prevuCumule = TOTAUX_MOIS_2026.slice(0, MOIS_COURANT_INDEX + 1).reduce((a, b) => a + b.montant, 0)
  const objCumule = objectifCumule(MOIS_COURANT_INDEX)
  const tauxRealisation = objCumule > 0 ? (prevuCumule / objCumule) * 100 : 0
  const projection = Math.round((tauxRealisation / 100) * OBJECTIF_ANNUEL)
  const tempsEcoule = tempsEcoulePondere(MOIS_COURANT_INDEX)

  const calendaire = Math.round(((MOIS_COURANT_INDEX + 1) / 12) * 100)
  const ecartMontant = prevuCumule - objCumule

  return (
    <>
      <Topbar title="Dashboard" subtitle="Vue synthétique · Cockpit de pilotage ACTE 1" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="CA prévu YTD" value={fmt(prevuCumule)} source="PREVISIONNEL · cumul Jan–Mar" accent="success" />
        <KpiCard label="Objectif YTD" value={fmt(Math.round(objCumule))} source="CONFIG · objectif × pondération cumulée" accent="default" />
        <KpiCard label="Projection annuelle" value={fmt(projection)} source="Taux réalisation × objectif annuel" accent={projection >= OBJECTIF_ANNUEL * 0.8 ? 'warning' : 'danger'} />
        <KpiCard label="Reste à facturer" value={fmt(resteFacturer)} source="PROJETS · somme reste (hors pipeline)" accent="info" />
      </div>

      {/* Progression annuelle */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
        <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Progression annuelle</h3>

        {/* Barre temps écoulé */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{calendaire}%</strong> de l'année écoulée
                <span className="text-[var(--text-secondary)]"> (représentant <strong className="text-[var(--accent)]">{fmtPct(tempsEcoule)}</strong> de l'objectif de CA)</span>
              </span>
              <InfoBulle text="L'année n'est pas linéaire : les mois d'été (Jul, Aoû) et décembre sont pondérés à ×0.5 car l'activité y est réduite. Ainsi, 25% du calendrier peut représenter 29% de l'effort annuel." />
            </div>
          </div>
          <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] opacity-30" style={{ width: `${Math.min(tempsEcoule, 100)}%` }} />
          </div>
        </div>

        {/* À date */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="font-sans text-sm text-[var(--text-secondary)]">
              À date : <strong className="text-[var(--text-primary)]">{fmt(prevuCumule)}</strong>
              <span className="text-[var(--text-secondary)]"> (soit <strong className={tauxRealisation >= 100 ? 'text-[var(--success)]' : tauxRealisation >= 80 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}>{fmtPct(tauxRealisation)}</strong> de l'objectif, <strong className={ecartMontant >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>{ecartMontant >= 0 ? '+' : ''}{fmtK(Math.round(ecartMontant))}</strong>)</span>
            </span>
            <InfoBulle text={`L'objectif cumulé à date est de ${fmt(Math.round(objCumule))}, calculé en additionnant les objectifs pondérés de chaque mois écoulé. Le montant affiché est la somme du prévisionnel de facturation de janvier au mois en cours.`} />
          </div>
          <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div
              className={`h-full rounded-full ${tauxRealisation >= 100 ? 'bg-emerald-500' : tauxRealisation >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(tauxRealisation, 100)}%` }}
            />
          </div>
        </div>

        {/* Projection */}
        <div className="flex items-center gap-1.5">
          <p className="font-sans text-sm text-[var(--text-secondary)]">
            Projection = <strong className="text-[var(--accent)]">{fmt(projection)}</strong>
            <span className="text-[var(--text-secondary)]"> (sur un objectif initial de {fmt(OBJECTIF_ANNUEL)})</span>
          </p>
          <InfoBulle text="La projection extrapole le rythme de facturation actuel sur l'ensemble de l'année. Si vous maintenez le même taux de réalisation, c'est le CA que vous atteindrez en fin d'exercice. Ce chiffre évolue chaque mois en fonction du réalisé." />
        </div>
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
        <SourceTag source="PROJETS · col. honoraires_ht, trié décroissant" />
      </div>

      {selectedProjet && <ProjetDetail projet={selectedProjet} onClose={() => setSelectedProjet(null)} />}
    </>
  )
}
