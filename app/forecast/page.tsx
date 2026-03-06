'use client'

import { useState } from 'react'
import { STATS_GLOBALES, PROJETS, MOIS_LABELS } from '@/lib/data'
import { fmt, MOIS_COURANT_INDEX } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import MonthGrid from '@/components/MonthGrid'
import MonthDetail from '@/components/MonthDetail'
import SourceTag from '@/components/SourceTag'

export default function ForecastPage() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(MOIS_COURANT_INDEX)

  const projetsAvecPlanif = PROJETS.filter((p) => p.total_2026 > 0).sort((a, b) => b.total_2026 - a.total_2026)

  return (
    <>
      <Topbar title="Forecast" subtitle="Cockpit financier mensuel · 2026" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard
          label="Total prévu 2026"
          value={fmt(STATS_GLOBALES.total_prevu_2026)}
          source='FORECAST 2026 · col. "TOTAL 2026"'
          accent="gold"
        />
        <KpiCard
          label="Reste à facturer"
          value={fmt(STATS_GLOBALES.total_reste_facturer)}
          source='FORECAST 2026 · col. "Reste à Facturer"'
          accent="green"
        />
        <KpiCard
          label="Pic mensuel"
          value={`${STATS_GLOBALES.pic_mensuel.mois} · ${fmt(STATS_GLOBALES.pic_mensuel.montant)}`}
          source="FORECAST 2026 · colonnes mensuelles"
          accent="blue"
        />
      </div>

      {/* Month Grid */}
      <div className="mb-6">
        <h3 className="font-serif text-lg text-text-main mb-4">Grille mensuelle</h3>
        <MonthGrid selected={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      {/* Month Detail */}
      {selectedMonth !== null && <MonthDetail moisIndex={selectedMonth} />}

      {/* Recap table */}
      <div className="mt-8 rounded-lg border border-border-custom bg-bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border-custom">
          <h3 className="font-serif text-lg text-text-main">Récapitulatif annuel par projet</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-custom text-text-muted font-mono">
                <th className="text-left px-3 py-2.5 sticky left-0 bg-bg-card z-10 min-w-[180px]">Projet</th>
                {MOIS_LABELS.map((m, i) => (
                  <th key={i} className={`text-right px-2 py-2.5 min-w-[65px] ${i === MOIS_COURANT_INDEX ? 'text-blue' : ''}`}>
                    {m}
                  </th>
                ))}
                <th className="text-right px-3 py-2.5 min-w-[80px] text-gold">Total</th>
              </tr>
            </thead>
            <tbody>
              {projetsAvecPlanif.map((p) => (
                <tr key={p.id} className="border-b border-border-custom/30 hover:bg-bg-hover/30">
                  <td className="px-3 py-2 font-sans text-text-main sticky left-0 bg-bg-card z-10 truncate max-w-[180px]">
                    {p.projet}
                  </td>
                  {p.mois.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 font-mono text-right ${
                        v === 0
                          ? 'text-border-custom'
                          : v >= 10000
                          ? 'text-gold'
                          : 'text-green'
                      }`}
                    >
                      {v === 0 ? '\u2014' : `${(v / 1000).toFixed(1)}k`}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-mono text-right text-gold font-semibold">
                    {fmt(p.total_2026)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border-custom">
          <SourceTag source="FORECAST 2026 · colonnes BH\u2013BT" />
        </div>
      </div>
    </>
  )
}
