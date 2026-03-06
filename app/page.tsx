import { STATS_GLOBALES, TOTAUX_MOIS_2026 } from '@/lib/data'
import { fmt, getAlertes, MOIS_COURANT_INDEX } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'
import AlertBanner from '@/components/AlertBanner'
import BarChartMensuel from '@/components/BarChartMensuel'

export default function DashboardPage() {
  const alertes = getAlertes()
  const moisCourant = TOTAUX_MOIS_2026[MOIS_COURANT_INDEX]
  const prevu = STATS_GLOBALES.total_prevu_2026
  const objectif = STATS_GLOBALES.objectif_annuel
  const pct = ((prevu / objectif) * 100).toFixed(1)
  const restant = objectif - prevu

  return (
    <>
      <Topbar title="Dashboard" subtitle="Vue d'ensemble · Forecast 2026" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Reste à facturer"
          value={fmt(STATS_GLOBALES.total_reste_facturer)}
          source='FORECAST 2026 · col. "Reste à Facturer"'
          accent="green"
        />
        <KpiCard
          label="Prévu 2026"
          value={fmt(prevu)}
          source='FORECAST 2026 · col. "TOTAL 2026"'
          accent="gold"
        />
        <KpiCard
          label={`${moisCourant.mois} (mois courant)`}
          value={fmt(moisCourant.montant)}
          source={`FORECAST 2026 · col. ${moisCourant.mois}`}
          accent="blue"
        />
        <KpiCard
          label="Alertes actives"
          value={String(alertes.length)}
          source="Détection auto états"
          accent="red"
        />
      </div>

      {/* Objectif */}
      <div className="rounded-lg border border-border-custom bg-bg-card p-5 mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-serif text-lg text-text-main">Objectif annuel</h3>
          <span className="font-mono text-sm text-gold">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-border-custom overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
            style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
          />
        </div>
        <p className="mt-2 font-sans text-sm text-text-muted">
          Il reste <span className="text-gold font-mono">{fmt(restant)}</span> à sécuriser
        </p>
        <SourceTag source="FORECAST 2026 · TOTAL 2026 vs objectif 800 000 €" />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border-custom bg-bg-card p-5 mb-8">
        <h3 className="font-serif text-lg text-text-main mb-4">Facturation mensuelle 2026</h3>
        <BarChartMensuel />
      </div>

      {/* Alertes */}
      <div className="mb-8">
        <h3 className="font-serif text-lg text-text-main mb-4">Alertes</h3>
        <div className="space-y-3">
          {alertes.map((a, i) => (
            <AlertBanner key={i} {...a} />
          ))}
        </div>
        <SourceTag source='FORECAST 2026 · col. "Etat"' />
      </div>
    </>
  )
}
