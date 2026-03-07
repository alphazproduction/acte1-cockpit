'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { TOTAUX_MOIS_2026 } from '@/lib/data'
import { fmt, fmtK, getTop3Mois, objectifMois, MOIS_COURANT_INDEX, PONDERATIONS } from '@/lib/utils'
import SourceTag from './SourceTag'

interface ChartData {
  mois: string
  prevu: number
  objectif: number
  poids: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.[0]) return null
  const index = TOTAUX_MOIS_2026.findIndex((m) => m.mois === label)
  const top3 = index >= 0 ? getTop3Mois(index) : []
  const obj = index >= 0 ? objectifMois(index) : 0

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-xl">
      <p className="font-mono text-sm text-[var(--accent)] font-semibold">{label} · {fmt(payload[0].value)}</p>
      <p className="font-mono text-xs text-[var(--text-secondary)] mt-0.5">Objectif : {fmt(obj)}</p>
      {top3.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {top3.map((line, i) => <li key={i} className="font-mono text-[11px] text-[var(--text-secondary)]">{line}</li>)}
        </ul>
      )}
    </div>
  )
}

export default function BarChartMensuel() {
  const data: ChartData[] = TOTAUX_MOIS_2026.map((m, i) => ({
    mois: m.mois,
    prevu: m.montant,
    objectif: Math.round(objectifMois(i)),
    poids: PONDERATIONS[i],
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
          <XAxis
            dataKey="mois"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Bar dataKey="objectif" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.2}>
            {data.map((_, index) => <Cell key={index} fill="#8b5cf6" />)}
          </Bar>
          <Bar dataKey="prevu" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => {
              const isPast = index < MOIS_COURANT_INDEX
              const isCurrent = index === MOIS_COURANT_INDEX
              let fill = '#8b5cf640'
              if (isCurrent) fill = '#8b5cf6'
              else if (isPast) {
                const ratio = entry.objectif > 0 ? entry.prevu / entry.objectif : 1
                if (ratio >= 1) fill = '#10b981'
                else if (ratio >= 0.8) fill = '#f59e0b'
                else fill = '#ef4444'
              }
              else if (entry.prevu === 0) fill = '#9ca3af20'
              return <Cell key={index} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Pondérations */}
      <div className="flex justify-around px-12 -mt-4 mb-2">
        {data.map((d, i) => (
          <span key={i} className="font-mono text-[9px] text-[var(--text-secondary)] opacity-60">
            &times;{d.poids}
          </span>
        ))}
      </div>
      <SourceTag source="PREVISIONNEL · colonnes Jan\u2013Déc" detail="Barres violettes semi-transparentes = objectif pondéré. Barres pleines = prévu. Vert >= 100%, Orange 80-100%, Rouge < 80%." />
    </div>
  )
}
