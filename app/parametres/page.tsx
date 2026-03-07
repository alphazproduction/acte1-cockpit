'use client'

import { useState, useEffect } from 'react'
import { Check, Link2 } from 'lucide-react'
import { MOIS_LABELS } from '@/lib/data'
import { PONDERATIONS, OBJECTIF_ANNUEL, objectifMois, fmt } from '@/lib/utils'
import { getGasUrl, setGasUrl, isApiConfigured } from '@/lib/api'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'

export default function ParametresPage() {
  const [apiUrl, setApiUrl] = useState('')
  const [connected, setConnected] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const url = getGasUrl()
    if (url) {
      setApiUrl(url)
      setConnected(true)
    }
  }, [])

  const handleSaveUrl = () => {
    if (apiUrl.trim()) {
      setGasUrl(apiUrl.trim())
      setConnected(true)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <>
      <Topbar title="Paramètres" subtitle="Configuration du cockpit de pilotage" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Connexion API */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={18} className="text-[var(--accent)]" />
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Connexion Google Sheets</h3>
            {connected && (
              <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                Connecté
              </span>
            )}
          </div>
          <p className="font-sans text-sm text-[var(--text-secondary)] mb-4">
            Collez l'URL du déploiement Web App de votre Google Apps Script. Les modifications dans le cockpit seront synchronisées avec le Google Sheet.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {saved ? <><Check size={14} /> Enregistré</> : 'Connecter'}
            </button>
          </div>
          <SourceTag source="CONFIG · URL Apps Script Web App" detail="Déployer > Nouveau déploiement > Application Web > Accès : Tout le monde" />
        </div>

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
                <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">&euro; HT</span>
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
                  &times;{PONDERATIONS[i]}
                </p>
                <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
                  {fmt(Math.round(objectifMois(i)))}
                </p>
              </div>
            ))}
          </div>
          <SourceTag source="CONFIG · pondérations mensuelles" detail="Jul=0.5, Aoû=0.5, Déc=0.5. Objectif mois = 400K × (poids / 10.5)" />
        </div>
      </div>
    </>
  )
}
