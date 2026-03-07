'use client'

import { MOIS_LABELS } from '@/lib/data'
import { PONDERATIONS, OBJECTIF_ANNUEL, objectifMois, fmt } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'

export default function ParametresPage() {
  return (
    <>
      <Topbar title="Paramètres" subtitle="Configuration du cockpit de pilotage" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Objectif */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Objectif annuel</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-mono text-xs text-[var(--text-secondary)] mb-1.5">Objectif par associé</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="400 000"
                  readOnly
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-sm text-[var(--text-primary)]"
                />
                <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">\u20AC HT</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Objectif mensuel moyen</span>
              <span className="font-mono text-sm text-[var(--accent)]">{fmt(Math.round(OBJECTIF_ANNUEL / 12))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Objectif mensuel pondéré moyen</span>
              <span className="font-mono text-sm text-[var(--accent)]">{fmt(Math.round(OBJECTIF_ANNUEL / 10.5))}</span>
            </div>
          </div>
          <SourceTag source="CONFIG · objectif_annuel" />
        </div>

        {/* Seuils */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Seuils de couleur</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Vert — Au-dessus objectif</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">&ge; 100%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Orange — Légèrement en dessous</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">80% – 100%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Rouge — En danger</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">&lt; 80%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Violet — Ligne objectif</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">Toujours visible</span>
            </div>
          </div>
          <SourceTag source="Paramètre interne · seuil 80% en V1" />
        </div>

        {/* Pondérations */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 lg:col-span-2">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Pondération mensuelle</h3>
          <p className="font-sans text-sm text-[var(--text-secondary)] mb-4">
            Les mois de juillet, août et décembre sont pondérés à 0.5 (activité réduite). Tous les autres à 1.0. Somme des poids : 10.5
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {MOIS_LABELS.map((m, i) => (
              <div key={i} className={`rounded-lg border p-3 text-center ${PONDERATIONS[i] < 1 ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5' : 'border-[var(--border)] bg-[var(--bg-primary)]'}`}>
                <p className="font-mono text-xs text-[var(--text-secondary)]">{m}</p>
                <p className={`font-mono text-lg font-semibold mt-1 ${PONDERATIONS[i] < 1 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
                  \u00D7{PONDERATIONS[i]}
                </p>
                <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
                  {fmt(Math.round(objectifMois(i)))}
                </p>
              </div>
            ))}
          </div>
          <SourceTag source="CONFIG · pondérations mensuelles" detail="Jul=0.5, Aoû=0.5, Déc=0.5. Objectif mois = 400K × (poids / 10.5)" />
        </div>

        {/* Source de données */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 lg:col-span-2">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Source de données</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="font-sans text-sm text-[var(--text-primary)]">Mode actuel</span>
              <span className="font-mono text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">POC — Données statiques</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="font-sans text-sm text-[var(--text-primary)]">Cible</span>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">Google Sheets via Apps Script API</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-sans text-sm text-[var(--text-primary)]">Google Sheet ID</span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">13S1qoigMo79Znnr...cK_yDPE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
