'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { TOTAUX_MOIS_2026, STATS_GLOBALES } from '@/lib/data'
import { fmt, getTop3Mois, MOIS_COURANT_INDEX } from '@/lib/utils'
import SourceTag from './SourceTag'

interface PayloadItem {
  mois: string
  montant: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.[0]) return null
  const index = TOTAUX_MOIS_2026.findIndex((m) => m.mois === label)
  const top3 = index >= 0 ? getTop3Mois(index) : []

  return (
    <div className="rounded-lg border border-border-custom bg-bg-card p-3 shadow-xl">
      <p className="font-mono text-sm text-gold font-semibold">{label} · {fmt(payload[0].value)}</p>
      {top3.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {top3.map((line, i) => (
            <li key={i} className="font-mono text-[11px] text-text-muted">{line}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function BarChartMensuel() {
  const data: PayloadItem[] = TOTAUX_MOIS_2026.map((m) => ({ mois: m.mois, montant: m.montant }))
  const objectif = STATS_GLOBALES.objectif_mensuel

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="mois"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8a8f9e', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8a8f9e', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            y={objectif}
            stroke="#c9a96e"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: `Objectif ${Math.round(objectif / 1000)}k`,
              position: 'right',
              fill: '#c9a96e',
              fontSize: 10,
              fontFamily: 'var(--font-dm-mono)',
            }}
          />
          <Bar dataKey="montant" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => {
              let fill = '#c9a96e'
              if (index === MOIS_COURANT_INDEX) fill = '#5b8dee'
              else if (entry.montant === 0) fill = '#2e3138'
              else if (entry.montant > objectif) fill = '#4caf82'
              return <Cell key={index} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <SourceTag source="FORECAST 2026 · colonnes mensuelles Jan\u2013Déc" />
    </div>
  )
}
