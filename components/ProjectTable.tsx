'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { PROJETS } from '@/lib/data'
import { fmt, getStatut } from '@/lib/utils'
import SparkLine from './SparkLine'
import SourceTag from './SourceTag'

type SortKey = 'projet' | 'honoraire' | 'reste' | 'total_2026'
type SortDir = 'asc' | 'desc'
type FilterMode = 'tous' | 'en-cours' | 'attente' | 'alertes'

export default function ProjectTable() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('tous')
  const [sortKey, setSortKey] = useState<SortKey>('total_2026')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...PROJETS]
    const q = search.toLowerCase()
    if (q) list = list.filter((p) => p.projet.toLowerCase().includes(q) || p.etat.toLowerCase().includes(q))
    if (filter === 'en-cours') list = list.filter((p) => {
      const e = p.etat.toLowerCase()
      return e.includes('en cours') || e.includes('validé')
    })
    if (filter === 'attente') list = list.filter((p) => p.etat.toLowerCase().includes('attente'))
    if (filter === 'alertes') list = list.filter((p) => {
      const e = p.etat.toLowerCase()
      return e.includes('gelé') || e.includes('stoppé') || e.includes('vérif') || (p.reste > 10000 && p.total_2026 === 0)
    })
    list.sort((a, b) => {
      const av = sortKey === 'projet' ? a.projet : a[sortKey]
      const bv = sortKey === 'projet' ? b.projet : b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return list
  }, [search, filter, sortKey, sortDir])

  const filters: { key: FilterMode; label: string }[] = [
    { key: 'tous', label: 'Tous' },
    { key: 'en-cours', label: 'En cours' },
    { key: 'attente', label: 'Attente' },
    { key: 'alertes', label: 'Alertes' },
  ]

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Rechercher un projet ou état..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-custom bg-bg-card pl-10 pr-4 py-2.5 font-sans text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-md font-mono text-xs transition-colors ${
                filter === f.key
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-bg-card text-text-muted border border-border-custom hover:bg-bg-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-custom bg-bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-custom text-text-muted font-mono text-xs">
                <th className="text-left px-4 py-3 cursor-pointer hover:text-text-main" onClick={() => toggleSort('projet')}>
                  Projet{sortArrow('projet')}
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Statut</th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-text-main" onClick={() => toggleSort('honoraire')}>
                  Honoraires{sortArrow('honoraire')}
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-text-main" onClick={() => toggleSort('reste')}>
                  Reste à fact.{sortArrow('reste')}
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-text-main" onClick={() => toggleSort('total_2026')}>
                  Total 2026{sortArrow('total_2026')}
                </th>
                <th className="text-center px-4 py-3 hidden md:table-cell">Planning</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const statut = getStatut(p.etat)
                return (
                  <tr key={p.id} className="border-b border-border-custom/50 hover:bg-bg-hover/30">
                    <td className="px-4 py-3">
                      <p className="font-sans text-text-main truncate max-w-[250px]">{p.projet}</p>
                      <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate max-w-[250px]">{p.etat}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono whitespace-nowrap ${statut.color}`}>
                        {statut.icon} {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-muted text-right">{fmt(p.honoraire)}</td>
                    <td className="px-4 py-3 font-mono text-green text-right">{fmt(p.reste)}</td>
                    <td className={`px-4 py-3 font-mono text-right ${p.total_2026 > 0 ? 'text-gold' : 'text-text-muted'}`}>
                      {fmt(p.total_2026)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex justify-center">
                        <SparkLine data={p.mois} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border-custom">
          <SourceTag source='FORECAST 2026 · colonnes E, G, BH\u2013BT' />
        </div>
      </div>
    </div>
  )
}
