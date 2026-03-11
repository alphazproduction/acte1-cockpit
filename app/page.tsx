'use client'

import { useState, useMemo } from 'react'
import { Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { type Projet, getProjetMois, getProjetTotal, getTotauxMois } from '@/lib/data'
import { fmt, fmtK, fmtPct, getAlertes, getTop5Projets, MOIS_COURANT_INDEX, OBJECTIF_ANNUEL, objectifCumule, tempsEcoulePondere } from '@/lib/utils'
import { useData } from '@/lib/useData'
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
  const { mode, projets, totaux, loading, error } = useData()
  const [chartView, setChartView] = useState<'mensuel' | 'ytd'>('mensuel')
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [annee, setAnnee] = useState(2026)
  const alertes = getAlertes()

  const isCurrent = annee === 2026
  const isFuture = annee > 2026

  // Totaux pour l'année sélectionnée
  const totauxAnnee = useMemo(() => {
    if (isCurrent) return totaux
    return getTotauxMois(annee).map((t) => ({ mois: t.mois, montant: t.montant }))
  }, [annee, totaux, isCurrent])

  // Top 5 par CA de l'année sélectionnée
  const top5 = useMemo(() => {
    if (isCurrent) {
      return mode === 'live'
        ? [...projets].sort((a, b) => b.reste - a.reste).slice(0, 5)
        : getTop5Projets()
    }
    return [...projets]
      .filter((p) => getProjetTotal(p, annee) > 0)
      .sort((a, b) => getProjetTotal(b, annee) - getProjetTotal(a, annee))
      .slice(0, 5)
  }, [annee, projets, mode, isCurrent])

  // Pour les années futures, on prend les 12 mois comme "objectif à date"
  const moisCourantIdx = isCurrent ? MOIS_COURANT_INDEX : 11

  // Reste à facturer sur l'année sélectionnée
  const resteAnnee = projets.reduce((sum, p) => {
    const moisData = getProjetMois(p, annee)
    const totalAn = getProjetTotal(p, annee)
    const factureYTD = isCurrent
      ? moisData.slice(0, MOIS_COURANT_INDEX + 1).reduce((a, b) => a + b, 0)
      : 0 // Année future : rien facturé encore
    return sum + Math.max(totalAn - factureYTD, 0)
  }, 0)

  const resteGlobal = projets
    .filter((p) => p.honoraire > 0)
    .reduce((sum, p) => sum + p.reste, 0)

  const prevuCumule = totauxAnnee.slice(0, moisCourantIdx + 1).reduce((a, b) => a + b.montant, 0)
  const totalAnnuel = totauxAnnee.reduce((a, b) => a + b.montant, 0)
  const objCumule = objectifCumule(moisCourantIdx)
  const tauxRealisation = objCumule > 0 ? (prevuCumule / objCumule) * 100 : 0
  const projection = isCurrent ? Math.round((tauxRealisation / 100) * OBJECTIF_ANNUEL) : totalAnnuel
  const tempsEcoule = isCurrent ? tempsEcoulePondere(MOIS_COURANT_INDEX) : 100

  const calendaire = isCurrent ? Math.round(((MOIS_COURANT_INDEX + 1) / 12) * 100) : 0
  const ecartMontant = prevuCumule - objCumule

  const hasData = totalAnnuel > 0 || annee === 2026

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Vue synthétique · ${mode === 'live' ? 'Connecté au Google Sheet' : 'Données POC'}`} />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
          <span className="font-mono text-sm text-[var(--text-secondary)]">Chargement des données...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-4 mb-6">
          <p className="font-sans text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Sélecteur d'année */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setAnnee((a) => a - 1)}
          disabled={annee <= 2026}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-serif text-3xl text-[var(--text-primary)] tabular-nums">{annee}</h2>
        <button
          onClick={() => setAnnee((a) => a + 1)}
          disabled={annee >= 2027}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!hasData && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-4 mb-6 text-center">
          <p className="font-sans text-sm text-amber-700 dark:text-amber-400">
            Aucune donnée prévisionnelle pour {annee}.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* KPIs */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCurrent ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-4 mb-8`}>
            {isCurrent && (
              <KpiCard label="Prévu à date" value={fmt(prevuCumule)} source="PREVISIONNEL · cumul Jan–Mar 2026" accent="success" />
            )}
            {isCurrent && (
              <KpiCard label="Objectif à date" value={fmt(Math.round(objCumule))} source="CONFIG · objectif × pondération cumulée" accent="default" />
            )}
            <KpiCard
              label={isCurrent ? 'Projection annuelle' : `Total prévu ${annee}`}
              value={fmt(isCurrent ? projection : totalAnnuel)}
              source={isCurrent ? 'Taux réalisation × objectif annuel' : `Somme des prévisionnels ${annee}`}
              accent={isCurrent ? (projection >= OBJECTIF_ANNUEL * 0.8 ? 'warning' : 'danger') : (totalAnnuel >= OBJECTIF_ANNUEL ? 'success' : totalAnnuel >= OBJECTIF_ANNUEL * 0.8 ? 'warning' : 'danger')}
            />
            <KpiCard
              label={`Reste à facturer (${annee})`}
              value={fmt(resteAnnee)}
              source={`PREVISIONNEL · total ${annee}${isCurrent ? ' − facturé YTD' : ''}`}
              accent="info"
            />
            {isCurrent && (
              <KpiCard label="Reste global (tous projets)" value={fmt(resteGlobal)} source="PROJETS · somme reste tous projets actifs" accent="default" />
            )}
          </div>

          {/* Progression annuelle - seulement pour l'année courante */}
          {isCurrent && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
              <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Progression annuelle {annee}</h3>

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

              <div className="flex items-center gap-1.5">
                <p className="font-sans text-sm text-[var(--text-secondary)]">
                  Projection = <strong className="text-[var(--accent)]">{fmt(projection)}</strong>
                  <span className="text-[var(--text-secondary)]"> (sur un objectif initial de {fmt(OBJECTIF_ANNUEL)})</span>
                </p>
                <InfoBulle text="La projection extrapole le rythme de facturation actuel sur l'ensemble de l'année. Si vous maintenez le même taux de réalisation, c'est le CA que vous atteindrez en fin d'exercice." />
              </div>
            </div>
          )}

          {/* Couverture annuelle pour années futures */}
          {isFuture && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
              <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Projection {annee}</h3>
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-sans text-sm text-[var(--text-secondary)]">
                    Total prévu : <strong className="text-[var(--text-primary)]">{fmt(totalAnnuel)}</strong>
                    <span className="text-[var(--text-secondary)]"> (soit <strong className={totalAnnuel >= OBJECTIF_ANNUEL ? 'text-[var(--success)]' : totalAnnuel >= OBJECTIF_ANNUEL * 0.8 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}>{fmtPct((totalAnnuel / OBJECTIF_ANNUEL) * 100)}</strong> de l'objectif)</span>
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${totalAnnuel >= OBJECTIF_ANNUEL ? 'bg-emerald-500' : totalAnnuel >= OBJECTIF_ANNUEL * 0.8 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((totalAnnuel / OBJECTIF_ANNUEL) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <p className="font-sans text-sm text-[var(--text-secondary)]">
                Objectif annuel : <strong className="text-[var(--accent)]">{fmt(OBJECTIF_ANNUEL)}</strong>
                <span className="text-[var(--text-secondary)]"> · Écart : <strong className={totalAnnuel >= OBJECTIF_ANNUEL ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>{totalAnnuel >= OBJECTIF_ANNUEL ? '+' : ''}{fmtK(totalAnnuel - OBJECTIF_ANNUEL)}</strong></span>
              </p>
            </div>
          )}

          {/* Alertes - seulement pour l'année courante */}
          {isCurrent && (
            <div className="mb-8">
              <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Alertes actives ({alertes.length})</h3>
              <div className="space-y-3">
                {alertes.map((a, i) => <AlertBanner key={i} {...a} />)}
              </div>
            </div>
          )}

          {/* Chart toggle */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Facturation {annee}</h3>
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
            {chartView === 'mensuel' ? <BarChartMensuel annee={annee} /> : <ChartYTD annee={annee} />}
          </div>

          {/* Top 5 */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">
              {isCurrent ? 'Top 5 projets par CA restant' : `Top 5 projets ${annee}`}
            </h3>
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
                  <p className="font-mono text-sm text-[var(--accent)] shrink-0 ml-4">
                    {isCurrent ? fmt(p.reste) : fmt(getProjetTotal(p, annee))}
                  </p>
                </div>
              ))}
            </div>
            <SourceTag source={isCurrent ? 'PROJETS · col. honoraires_ht, trié décroissant' : `PREVISIONNEL ${annee} · trié par total décroissant`} />
          </div>

          {selectedProjet && <ProjetDetail projet={selectedProjet} onClose={() => setSelectedProjet(null)} />}
        </>
      )}
    </>
  )
}
