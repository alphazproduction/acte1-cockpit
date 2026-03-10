'use client'

import { useState, useEffect } from 'react'
import { Check, Link2, ExternalLink, RotateCcw } from 'lucide-react'
import { MOIS_LABELS } from '@/lib/data'
import { fmt } from '@/lib/utils'
import { getGasUrl, setGasUrl } from '@/lib/api'
import {
  getObjectifAnnuel, setObjectifAnnuel,
  getPonderations, setPonderationsConfig, getSommePoids,
  getSheetUrl, setSheetUrl,
} from '@/lib/config'
import Topbar from '@/components/Topbar'
import SourceTag from '@/components/SourceTag'

export default function ParametresPage() {
  const [apiUrl, setApiUrlState] = useState('')
  const [sheetUrl, setSheetUrlState] = useState('')
  const [connected, setConnected] = useState(false)
  const [saved, setSaved] = useState(false)
  const [objectif, setObjectif] = useState(400000)
  const [ponderations, setPonderations] = useState([1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5])
  const [objSaved, setObjSaved] = useState(false)
  const [pondSaved, setPondSaved] = useState(false)

  useEffect(() => {
    const url = getGasUrl()
    if (url) { setApiUrlState(url); setConnected(true) }
    setSheetUrlState(getSheetUrl())
    setObjectif(getObjectifAnnuel())
    setPonderations(getPonderations())
  }, [])

  const sommePoids = getSommePoids(ponderations)

  const handleSaveUrl = () => {
    if (apiUrl.trim()) {
      setGasUrl(apiUrl.trim())
      setConnected(true)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleSaveSheet = () => {
    setSheetUrl(sheetUrl.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveObjectif = () => {
    setObjectifAnnuel(objectif)
    setObjSaved(true)
    setTimeout(() => setObjSaved(false), 2000)
  }

  const handlePondChange = (i: number, v: number) => {
    const next = [...ponderations]
    next[i] = Math.round(v * 10) / 10
    setPonderations(next)
  }

  const handleSavePond = () => {
    setPonderationsConfig(ponderations)
    setPondSaved(true)
    setTimeout(() => setPondSaved(false), 2000)
  }

  const handleResetPond = () => {
    const defaults = [1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5]
    setPonderations(defaults)
    setPonderationsConfig(defaults)
  }

  const objMois = (i: number) => objectif * (ponderations[i] / sommePoids)

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
            Collez l'URL du déploiement Web App de votre Google Apps Script.
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
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

          {/* Lien direct Google Sheet */}
          <p className="font-sans text-sm text-[var(--text-secondary)] mb-2">
            Lien direct vers le Google Sheet source (pour ouvrir rapidement) :
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrlState(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleSaveSheet}
              className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-xs hover:bg-[var(--bg-hover)] transition-colors"
            >
              Enregistrer
            </button>
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <ExternalLink size={14} /> Ouvrir
              </a>
            )}
          </div>
          <SourceTag source="CONFIG · URL Apps Script + lien Sheet" detail="Déployer > Nouveau déploiement > Application Web > Accès : Tout le monde" />
        </div>

        {/* Objectif */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Objectif annuel</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-mono text-xs text-[var(--text-secondary)] mb-1.5">Objectif par associé</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={objectif}
                  onChange={(e) => setObjectif(parseInt(e.target.value) || 0)}
                  step={10000}
                  min={0}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">&euro; HT</span>
                <button
                  onClick={handleSaveObjectif}
                  className="px-3 py-2.5 rounded-lg bg-[var(--accent)] text-white font-mono text-xs hover:opacity-90 transition-opacity shrink-0"
                >
                  {objSaved ? <Check size={14} /> : 'OK'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Objectif mensuel moyen</span>
              <span className="font-mono text-sm text-[var(--accent)]">{fmt(Math.round(objectif / 12))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Objectif mensuel pondéré moyen</span>
              <span className="font-mono text-sm text-[var(--accent)]">{fmt(Math.round(objectif / sommePoids))}</span>
            </div>
          </div>
          <SourceTag source="CONFIG · objectif_annuel (modifiable)" />
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
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Violet — Ligne objectif / mois courant</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">Toujours visible</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500" />
                <span className="font-sans text-sm text-[var(--text-primary)]">Gris — Mois passés / inactif</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">Atténué</span>
            </div>
          </div>
          <SourceTag source="Paramètre interne · seuil 80% en V1" />
        </div>

        {/* Pondérations avec sliders */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Pondération mensuelle</h3>
              <p className="font-sans text-sm text-[var(--text-secondary)] mt-1">
                Ajustez la pondération de chaque mois. Somme des poids : <strong className="text-[var(--accent)]">{sommePoids.toFixed(1)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPond}
                className="px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-mono text-xs hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <button
                onClick={handleSavePond}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {pondSaved ? <><Check size={14} /> Sauvé</> : 'Enregistrer'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {MOIS_LABELS.map((m, i) => (
              <div key={i} className={`rounded-lg border p-3 text-center ${ponderations[i] < 1 ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5' : 'border-[var(--border)] bg-[var(--bg-primary)]'}`}>
                <p className="font-mono text-xs text-[var(--text-secondary)]">{m}</p>
                <p className={`font-mono text-lg font-semibold mt-1 ${ponderations[i] < 1 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
                  &times;{ponderations[i].toFixed(1)}
                </p>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.1}
                  value={ponderations[i]}
                  onChange={(e) => handlePondChange(i, parseFloat(e.target.value))}
                  className="w-full h-1.5 mt-2 rounded-full appearance-none cursor-pointer accent-[var(--accent)] bg-[var(--bg-secondary)]"
                />
                <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
                  {fmt(Math.round(objMois(i)))}
                </p>
              </div>
            ))}
          </div>
          <SourceTag source="CONFIG · pondérations mensuelles (modifiables)" detail={`Somme poids = ${sommePoids.toFixed(1)}. Objectif mois = ${fmt(objectif)} × (poids / ${sommePoids.toFixed(1)})`} />
        </div>
      </div>
    </>
  )
}
