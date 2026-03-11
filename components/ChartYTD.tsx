'use client'

import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'
import { MOIS_LABELS, getTotauxMois } from '@/lib/data'
import { fmt, objectifMois, MOIS_COURANT_INDEX } from '@/lib/utils'
import SourceTag from './SourceTag'

interface DataPoint {
  mois: string
  prevuCumule: number
  objectifCumule: number
  projectionCumule: number | null
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-xl">
      <p className="font-mono text-xs text-[var(--text-primary)] font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-[11px]" style={{ color: p.color }}>
          {p.dataKey === 'objectifCumule' ? 'Objectif' : p.dataKey === 'prevuCumule' ? 'Prévu' : 'Projection'} : {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function ChartYTD({ annee = 2026 }: { annee?: number }) {
  const totaux = getTotauxMois(annee)
  const isCurrent = annee === 2026

  let prevuSum = 0
  let objSum = 0

  const data: DataPoint[] = MOIS_LABELS.map((mois, i) => {
    prevuSum += totaux[i].montant
    objSum += objectifMois(i)
    return {
      mois,
      prevuCumule: prevuSum,
      objectifCumule: Math.round(objSum),
      projectionCumule: null,
    }
  })

  // Projection à partir du mois courant (seulement pour l'année en cours)
  if (isCurrent && MOIS_COURANT_INDEX > 0) {
    const ratioActuel = data[MOIS_COURANT_INDEX].prevuCumule / data[MOIS_COURANT_INDEX].objectifCumule
    let projSum = data[MOIS_COURANT_INDEX].prevuCumule
    for (let i = MOIS_COURANT_INDEX; i < 12; i++) {
      if (i > MOIS_COURANT_INDEX) projSum += objectifMois(i) * ratioActuel
      data[i].projectionCumule = Math.round(projSum)
    }
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          {isCurrent && (
            <ReferenceLine x={MOIS_LABELS[MOIS_COURANT_INDEX]} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Aujourd\'hui', position: 'top', fill: '#8b5cf6', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }} />
          )}
          <Area type="monotone" dataKey="objectifCumule" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 4" fill="#8b5cf610" />
          <Area type="monotone" dataKey="prevuCumule" stroke="#10b981" strokeWidth={2.5} fill="#10b98115" />
          {data.some((d) => d.projectionCumule !== null) && (
            <Line type="monotone" dataKey="projectionCumule" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls={false} />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <SourceTag source={`PREVISIONNEL ${annee} · cumul mensuel vs objectif pondéré`} detail="Vert = prévu cumulé. Violet pointillé = objectif cumulé pondéré. Orange pointillé = projection basée sur le rythme actuel." />
    </div>
  )
}
