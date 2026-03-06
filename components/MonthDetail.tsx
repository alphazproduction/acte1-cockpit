import { MOIS_LABELS } from '@/lib/data'
import { fmt, getStatut, getProjetsDuMois } from '@/lib/utils'
import SourceTag from './SourceTag'

interface MonthDetailProps {
  moisIndex: number
}

export default function MonthDetail({ moisIndex }: MonthDetailProps) {
  const projets = getProjetsDuMois(moisIndex)
  const label = MOIS_LABELS[moisIndex]

  if (projets.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-border-custom bg-bg-card p-6 text-center">
        <p className="text-text-muted font-sans text-sm">Aucun projet planifié pour {label} 2026</p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-border-custom bg-bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border-custom">
        <h3 className="font-serif text-lg text-text-main">Projets · {label} 2026</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-custom text-text-muted font-mono text-xs">
              <th className="text-left px-4 py-2.5">Projet</th>
              <th className="text-right px-4 py-2.5">Montant prévu</th>
              <th className="text-right px-4 py-2.5">Reste total</th>
              <th className="text-left px-4 py-2.5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {projets.map((p) => {
              const statut = getStatut(p.etat)
              return (
                <tr key={p.id} className="border-b border-border-custom/50 hover:bg-bg-hover/30">
                  <td className="px-4 py-2.5 font-sans text-text-main">{p.projet}</td>
                  <td className="px-4 py-2.5 font-mono text-gold text-right">{fmt(p.mois[moisIndex])}</td>
                  <td className="px-4 py-2.5 font-mono text-green text-right">{fmt(p.reste)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${statut.color}`}>
                      {statut.icon} {statut.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2">
        <SourceTag source={`FORECAST 2026 · col. ${label}`} />
      </div>
    </div>
  )
}
