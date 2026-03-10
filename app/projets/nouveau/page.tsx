'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, ArrowLeft } from 'lucide-react'
import { MOIS_LABELS } from '@/lib/data'
import { fmt } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import Link from 'next/link'

const ETATS = [
  'En cours',
  'Attente signature contrat',
  'Attente contrat',
  'Attente paiement',
  'Attente OS',
  'Gelé',
  'Arrêté',
]

export default function NouveauProjetPage() {
  const router = useRouter()

  const [code, setCode] = useState('')
  const [projet, setProjet] = useState('')
  const [etat, setEtat] = useState('En cours')
  const [honoraire, setHonoraire] = useState<number | ''>('')
  const [factureN1, setFactureN1] = useState<number | ''>('')
  const [debut, setDebut] = useState('')
  const [finInitiale, setFinInitiale] = useState('')
  const [finRevisee, setFinRevisee] = useState('')
  const [mois, setMois] = useState<number[]>(Array(12).fill(0))
  const [toast, setToast] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const total2026 = useMemo(() => mois.reduce((a, b) => a + b, 0), [mois])
  const resteAFacturer = useMemo(() => {
    const h = typeof honoraire === 'number' ? honoraire : 0
    const f = typeof factureN1 === 'number' ? factureN1 : 0
    return h - f
  }, [honoraire, factureN1])

  const updateMois = (index: number, value: string) => {
    const n = value === '' ? 0 : parseFloat(value)
    if (isNaN(n)) return
    setMois((prev) => {
      const next = [...prev]
      next[index] = n
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode || trimmedCode.length < 2 || trimmedCode.length > 4) {
      newErrors.code = 'Le code doit contenir 2 à 4 caractères'
    }
    if (!projet.trim()) {
      newErrors.projet = 'Le nom du projet est requis'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const newProjet = {
      id: `custom-${trimmedCode.toLowerCase()}-${Date.now()}`,
      code: trimmedCode,
      projet: projet.trim(),
      etat,
      honoraire: typeof honoraire === 'number' ? honoraire : 0,
      facture_n1: typeof factureN1 === 'number' ? factureN1 : 0,
      reste: resteAFacturer,
      mois,
      total_2026: total2026,
      debut: debut || null,
      fin_initiale: finInitiale || null,
      fin_revisee: finRevisee || null,
    }

    const existing = JSON.parse(localStorage.getItem('projets-custom') || '[]')
    existing.push(newProjet)
    localStorage.setItem('projets-custom', JSON.stringify(existing))

    setToast(true)
    setTimeout(() => {
      router.push('/forecast')
    }, 1200)
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]'

  const labelClass = 'block font-mono text-xs text-[var(--text-secondary)] mb-1.5'

  return (
    <>
      <Topbar title="Nouveau projet" subtitle="Ajouter un projet au prévisionnel" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-sans text-sm text-emerald-700 dark:text-emerald-400">
            Projet enregistré avec succès
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lien retour */}
        <Link
          href="/forecast"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={14} />
          Retour au forecast
        </Link>

        {/* Informations générales */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} className="text-[var(--accent)]" />
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Informations générales</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Code trigramme */}
            <div>
              <label className={labelClass}>
                Code (trigramme) <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 4))
                  setErrors((prev) => ({ ...prev, code: '' }))
                }}
                placeholder="EX: PAL"
                maxLength={4}
                className={`${inputClass} uppercase ${errors.code ? 'border-[var(--danger)]' : ''}`}
              />
              {errors.code && (
                <p className="font-mono text-[10px] text-[var(--danger)] mt-1">{errors.code}</p>
              )}
            </div>

            {/* Nom du projet */}
            <div className="sm:col-span-1 lg:col-span-2">
              <label className={labelClass}>
                Nom du projet <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                value={projet}
                onChange={(e) => {
                  setProjet(e.target.value)
                  setErrors((prev) => ({ ...prev, projet: '' }))
                }}
                placeholder="Nom complet du projet"
                className={`${inputClass} ${errors.projet ? 'border-[var(--danger)]' : ''}`}
              />
              {errors.projet && (
                <p className="font-mono text-[10px] text-[var(--danger)] mt-1">{errors.projet}</p>
              )}
            </div>

            {/* État */}
            <div>
              <label className={labelClass}>État</label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value)}
                className={inputClass}
              >
                {ETATS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Honoraires HT */}
            <div>
              <label className={labelClass}>Honoraires HT</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={honoraire === '' ? '' : honoraire}
                  onChange={(e) =>
                    setHonoraire(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0"
                  min={0}
                  step={100}
                  className={inputClass}
                />
                <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">&euro;</span>
              </div>
            </div>

            {/* Facturé N-1 */}
            <div>
              <label className={labelClass}>Facturé N-1</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={factureN1 === '' ? '' : factureN1}
                  onChange={(e) =>
                    setFactureN1(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0"
                  min={0}
                  step={100}
                  className={inputClass}
                />
                <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">&euro;</span>
              </div>
            </div>
          </div>

          {/* Computed values */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[var(--border)]">
            <div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">Reste à facturer</span>
              <p className={`font-mono text-sm font-semibold ${resteAFacturer > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                {fmt(resteAFacturer)}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Dates</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Début</label>
              <input
                type="month"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fin initiale</label>
              <input
                type="month"
                value={finInitiale}
                onChange={(e) => setFinInitiale(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fin révisée</label>
              <input
                type="month"
                value={finRevisee}
                onChange={(e) => setFinRevisee(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Prévisionnel mensuel 2026 */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Prévisionnel mensuel 2026</h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--text-secondary)]">Total 2026</span>
              <span className={`font-mono text-sm font-semibold px-2.5 py-1 rounded-lg border ${total2026 > 0 ? 'text-[var(--accent)] border-[var(--accent)]/20 bg-[var(--accent)]/5' : 'text-[var(--text-secondary)] border-[var(--border)] bg-[var(--bg-primary)]'}`}>
                {fmt(total2026)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {MOIS_LABELS.map((label, i) => (
              <div key={i} className="space-y-1">
                <label className="block font-mono text-[10px] text-[var(--text-secondary)] text-center">
                  {label}
                </label>
                <input
                  type="number"
                  value={mois[i] === 0 ? '' : mois[i]}
                  onChange={(e) => updateMois(i, e.target.value)}
                  placeholder="0"
                  min={0}
                  step={100}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-2 font-mono text-xs text-center text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/forecast"
            className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] font-mono text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Save size={14} />
            Enregistrer le projet
          </button>
        </div>
      </form>
    </>
  )
}
