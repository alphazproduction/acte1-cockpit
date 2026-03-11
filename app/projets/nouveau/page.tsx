'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, ArrowLeft, Trash2, Users, Building2, CalendarClock } from 'lucide-react'
import { MOIS_LABELS, PROJETS } from '@/lib/data'
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

const ROLES_INTERLOCUTEUR = [
  'Maître d\'ouvrage',
  'Architecte',
  'Bureau d\'études',
  'Économiste',
  'Scénographe',
  'Acousticien',
  'Paysagiste',
  'Autre',
]

const TYPES_ECHEANCE = [
  'Acompte',
  'Situation',
  'Solde',
  'Avance',
  'Retenue de garantie',
  'Autre',
] as const

type TypeEcheance = typeof TYPES_ECHEANCE[number]

interface Interlocuteur {
  id: string
  nom: string
  role: string
  societe: string
  email: string
  tel: string
}

interface EcheancePrev {
  id: string
  type: TypeEcheance
  montant: number | ''
  date: string
  description: string
}

// Load saved sociétés from localStorage
function getSocietesConnues(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('societes-connues')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveSociete(nom: string) {
  const list = getSocietesConnues()
  if (nom && !list.includes(nom)) {
    list.push(nom)
    list.sort()
    localStorage.setItem('societes-connues', JSON.stringify(list))
  }
}

export default function NouveauProjetPage() {
  const router = useRouter()

  const existingCodes = useMemo(() => new Set(PROJETS.map((p) => p.code.toUpperCase())), [])

  const suggestCode = (nom: string): string => {
    const words = nom.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/).filter(Boolean)
    if (words.length === 0) return ''
    let candidate = ''
    if (words.length >= 3) {
      candidate = words.slice(0, 3).map((w) => w[0]).join('')
    } else if (words.length === 2) {
      candidate = words[0].slice(0, 2) + words[1][0]
    } else {
      candidate = words[0].slice(0, 3)
    }
    if (!existingCodes.has(candidate)) return candidate
    for (let i = 1; i <= 9; i++) {
      const alt = candidate.slice(0, 2) + i
      if (!existingCodes.has(alt)) return alt
    }
    return candidate
  }

  // General info
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

  // Client / Prestataire info
  const [client, setClient] = useState('')
  const [clientSociete, setClientSociete] = useState('')
  const [architecte, setArchitecte] = useState('')
  const [architecteSociete, setArchitecteSociete] = useState('')
  const [interlocuteurs, setInterlocuteurs] = useState<Interlocuteur[]>([])

  // Échéancier prévisionnel
  const [echeances, setEcheances] = useState<EcheancePrev[]>([])

  const societesConnues = useMemo(() => getSocietesConnues(), [])

  const total2026 = useMemo(() => mois.reduce((a, b) => a + b, 0), [mois])
  const resteAFacturer = useMemo(() => {
    const h = typeof honoraire === 'number' ? honoraire : 0
    const f = typeof factureN1 === 'number' ? factureN1 : 0
    return h - f
  }, [honoraire, factureN1])

  const totalEcheances = useMemo(
    () => echeances.reduce((s, e) => s + (typeof e.montant === 'number' ? e.montant : 0), 0),
    [echeances],
  )

  const updateMois = (index: number, value: string) => {
    const n = value === '' ? 0 : parseFloat(value)
    if (isNaN(n)) return
    setMois((prev) => {
      const next = [...prev]
      next[index] = n
      return next
    })
  }

  // Interlocuteurs handlers
  const addInterlocuteur = () => {
    setInterlocuteurs((prev) => [...prev, {
      id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nom: '',
      role: 'Maître d\'ouvrage',
      societe: '',
      email: '',
      tel: '',
    }])
  }

  const updateInterlocuteur = (id: string, field: keyof Interlocuteur, value: string) => {
    setInterlocuteurs((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i))
  }

  const removeInterlocuteur = (id: string) => {
    setInterlocuteurs((prev) => prev.filter((i) => i.id !== id))
  }

  // Échéancier handlers
  const addEcheance = () => {
    setEcheances((prev) => [...prev, {
      id: `ech-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'Situation',
      montant: '',
      date: '',
      description: '',
    }])
  }

  const updateEcheance = (id: string, field: keyof EcheancePrev, value: string | number) => {
    setEcheances((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e))
  }

  const removeEcheance = (id: string) => {
    setEcheances((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode || trimmedCode.length < 2 || trimmedCode.length > 4) {
      newErrors.code = 'Le code doit contenir 2 à 4 caractères'
    } else if (existingCodes.has(trimmedCode)) {
      newErrors.code = `Le code "${trimmedCode}" existe déjà`
    }
    if (!projet.trim()) {
      newErrors.projet = 'Le nom du projet est requis'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save sociétés to base
    if (clientSociete.trim()) saveSociete(clientSociete.trim())
    if (architecteSociete.trim()) saveSociete(architecteSociete.trim())
    for (const inter of interlocuteurs) {
      if (inter.societe.trim()) saveSociete(inter.societe.trim())
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
      client: client.trim() || null,
      client_societe: clientSociete.trim() || null,
      architecte: architecte.trim() || null,
      architecte_societe: architecteSociete.trim() || null,
      interlocuteurs: interlocuteurs.filter((i) => i.nom.trim()),
      echeances: echeances.filter((e) => typeof e.montant === 'number' && e.montant > 0).map((e) => ({
        type: e.type,
        montant: e.montant,
        date: e.date,
        description: e.description,
      })),
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
              {!errors.code && code && existingCodes.has(code.toUpperCase()) && (
                <p className="font-mono text-[10px] text-[var(--warning)] mt-1">Ce code existe déjà</p>
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
                  const val = e.target.value
                  setProjet(val)
                  setErrors((prev) => ({ ...prev, projet: '' }))
                  if (!code || code === suggestCode(projet)) {
                    setCode(suggestCode(val))
                  }
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

        {/* Client & Acteurs du projet */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-[var(--accent)]" />
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Client & acteurs du projet</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Client (MOA) */}
            <div>
              <label className={labelClass}>Client (Maître d&apos;ouvrage)</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nom du contact"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Société client</label>
              <input
                type="text"
                value={clientSociete}
                onChange={(e) => setClientSociete(e.target.value)}
                placeholder="Nom de la société"
                list="societes-list"
                className={inputClass}
              />
            </div>

            {/* Architecte */}
            <div>
              <label className={labelClass}>Architecte / MOE</label>
              <input
                type="text"
                value={architecte}
                onChange={(e) => setArchitecte(e.target.value)}
                placeholder="Nom du contact"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Société architecte</label>
              <input
                type="text"
                value={architecteSociete}
                onChange={(e) => setArchitecteSociete(e.target.value)}
                placeholder="Nom de l'agence"
                list="societes-list"
                className={inputClass}
              />
            </div>
          </div>

          {/* Datalist for known sociétés */}
          <datalist id="societes-list">
            {societesConnues.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          {/* Interlocuteurs dynamiques */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--text-secondary)]" />
                <span className="font-mono text-xs text-[var(--text-secondary)]">Autres interlocuteurs</span>
              </div>
              <button
                type="button"
                onClick={addInterlocuteur}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>

            {interlocuteurs.length === 0 && (
              <p className="font-sans text-xs text-[var(--text-secondary)] italic">
                Aucun interlocuteur ajouté. Cliquez sur &laquo; Ajouter &raquo; pour en ajouter.
              </p>
            )}

            <div className="space-y-3">
              {interlocuteurs.map((inter) => (
                <div key={inter.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className={labelClass}>Nom</label>
                    <input
                      type="text"
                      value={inter.nom}
                      onChange={(e) => updateInterlocuteur(inter.id, 'nom', e.target.value)}
                      placeholder="Prénom Nom"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Rôle</label>
                    <select
                      value={inter.role}
                      onChange={(e) => updateInterlocuteur(inter.id, 'role', e.target.value)}
                      className={inputClass}
                    >
                      {ROLES_INTERLOCUTEUR.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Société</label>
                    <input
                      type="text"
                      value={inter.societe}
                      onChange={(e) => updateInterlocuteur(inter.id, 'societe', e.target.value)}
                      placeholder="Société"
                      list="societes-list"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={inter.email}
                      onChange={(e) => updateInterlocuteur(inter.id, 'email', e.target.value)}
                      placeholder="email@exemple.fr"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInterlocuteur(inter.id)}
                    className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
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

        {/* Échéancier prévisionnel */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock size={18} className="text-[var(--accent)]" />
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Échéancier prévisionnel</h3>
            </div>
            <div className="flex items-center gap-4">
              {echeances.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--text-secondary)]">Total échéancier</span>
                  <span className={`font-mono text-sm font-semibold px-2.5 py-1 rounded-lg border ${totalEcheances > 0 ? 'text-[var(--accent)] border-[var(--accent)]/20 bg-[var(--accent)]/5' : 'text-[var(--text-secondary)] border-[var(--border)] bg-[var(--bg-primary)]'}`}>
                    {fmt(totalEcheances)}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={addEcheance}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>
          </div>

          {echeances.length === 0 ? (
            <p className="font-sans text-xs text-[var(--text-secondary)] italic">
              Aucune échéance définie. Ajoutez les jalons de facturation prévisionnels.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-[120px_1fr_140px_1fr_auto] gap-3 px-1">
                <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">Type</span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">Montant HT</span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">Date prévue</span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">Description</span>
                <span className="w-[40px]" />
              </div>

              {echeances.map((ech) => (
                <div key={ech.id} className="grid grid-cols-[120px_1fr_140px_1fr_auto] gap-3 items-center">
                  <select
                    value={ech.type}
                    onChange={(e) => updateEcheance(ech.id, 'type', e.target.value)}
                    className={inputClass}
                  >
                    {TYPES_ECHEANCE.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={ech.montant === '' ? '' : ech.montant}
                      onChange={(e) => updateEcheance(ech.id, 'montant', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="0"
                      min={0}
                      step={100}
                      className={inputClass}
                    />
                    <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">&euro;</span>
                  </div>
                  <input
                    type="date"
                    value={ech.date}
                    onChange={(e) => updateEcheance(ech.id, 'date', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={ech.description}
                    onChange={(e) => updateEcheance(ech.id, 'description', e.target.value)}
                    placeholder="Phase, livrable..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeEcheance(ech.id)}
                    className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Coherence check */}
              {totalEcheances > 0 && resteAFacturer > 0 && (
                <div className={`mt-2 px-3 py-2 rounded-lg border text-xs font-mono ${
                  Math.abs(totalEcheances - resteAFacturer) < 1
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  Échéancier : {fmt(totalEcheances)} / Reste à facturer : {fmt(resteAFacturer)}
                  {Math.abs(totalEcheances - resteAFacturer) < 1
                    ? ' — Cohérent'
                    : ` — Écart de ${fmt(Math.abs(totalEcheances - resteAFacturer))}`
                  }
                </div>
              )}
            </div>
          )}
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
