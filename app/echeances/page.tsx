'use client'

import { useState, useEffect, useMemo } from 'react'
import { PROJETS } from '@/lib/data'
import { fmt } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'
import { CalendarClock, Plus, Trash2, Check, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────

type Statut = 'A emettre' | 'Emise' | 'Payee' | 'En retard'
type TypeEcheance = 'Acompte' | 'Situation' | 'Solde' | 'Avance' | 'Retenue de garantie' | 'Autre'

interface Echeance {
  id: string
  projetId: string
  projetNom: string
  projetCode: string
  type: TypeEcheance
  montant: number
  date: string
  statut: Statut
  notes: string
}

// ── Constantes ──────────────────────────────────────────────────

const TYPES_ECHEANCE: TypeEcheance[] = [
  'Acompte', 'Situation', 'Solde', 'Avance', 'Retenue de garantie', 'Autre',
]

const TYPE_STYLES: Record<TypeEcheance, string> = {
  'Acompte': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  'Situation': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
  'Solde': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  'Avance': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30',
  'Retenue de garantie': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
  'Autre': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30',
}

const STATUT_STYLES: Record<Statut, string> = {
  'A emettre': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30',
  'Emise': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  'Payee': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  'En retard': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
}

const STORAGE_KEY = 'echeances'

const SEED_DATA: Echeance[] = [
  { id: 'seed-1', projetId: 'palc-chalons', projetNom: 'PALC - Chalons - Moatti', projetCode: 'PAL', type: 'Situation', montant: 9565, date: '2026-04-15', statut: 'Emise', notes: '' },
  { id: 'seed-2', projetId: 'palc-chalons', projetNom: 'PALC - Chalons - Moatti', projetCode: 'PAL', type: 'Acompte', montant: 7515, date: '2026-06-30', statut: 'A emettre', notes: '' },
  { id: 'seed-3', projetId: 'cinema-bobigny', projetNom: 'Cinéma Bobigny - Suite', projetCode: 'BOB', type: 'Situation', montant: 1850, date: '2026-02-28', statut: 'Payee', notes: '' },
  { id: 'seed-4', projetId: 'cinema-bobigny', projetNom: 'Cinéma Bobigny - Suite', projetCode: 'BOB', type: 'Solde', montant: 3800, date: '2026-04-30', statut: 'A emettre', notes: '' },
  { id: 'seed-5', projetId: 'rte-base-avenant', projetNom: 'RTE : Base et Avenant', projetCode: 'RTE', type: 'Acompte', montant: 3675, date: '2026-03-31', statut: 'A emettre', notes: '' },
  { id: 'seed-6', projetId: 'rte-base-avenant', projetNom: 'RTE : Base et Avenant', projetCode: 'RTE', type: 'Situation', montant: 5250, date: '2026-04-30', statut: 'A emettre', notes: '' },
  { id: 'seed-7', projetId: 'rte-base-avenant', projetNom: 'RTE : Base et Avenant', projetCode: 'RTE', type: 'Retenue de garantie', montant: 2100, date: '2026-08-31', statut: 'A emettre', notes: '' },
  { id: 'seed-8', projetId: 'pb-museo', projetNom: 'Palais Bourbon Moatti - muséo', projetCode: 'PBM', type: 'Situation', montant: 1800, date: '2026-01-31', statut: 'En retard', notes: '' },
  { id: 'seed-9', projetId: 'pb-museo', projetNom: 'Palais Bourbon Moatti - muséo', projetCode: 'PBM', type: 'Avance', montant: 900, date: '2026-03-15', statut: 'A emettre', notes: '' },
]

// ── Helpers ──────────────────────────────────────────────────────

function generateId(): string {
  return `ech-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Component ───────────────────────────────────────────────────

export default function EcheancierPage() {
  const [echeances, setEcheances] = useState<Echeance[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Form state
  const [formProjetId, setFormProjetId] = useState('')
  const [formType, setFormType] = useState<TypeEcheance>('Situation')
  const [formMontant, setFormMontant] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formStatut, setFormStatut] = useState<Statut>('A emettre')
  const [formNotes, setFormNotes] = useState('')

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        // Migration: add projetCode and type if missing
        const migrated = parsed.map((e: Echeance) => {
          if (!e.projetCode) {
            const projet = PROJETS.find((p) => p.id === e.projetId)
            e.projetCode = projet?.code ?? '???'
          }
          if (!e.type) {
            e.type = 'Autre'
          }
          return e
        })
        setEcheances(migrated)
      } catch {
        setEcheances(SEED_DATA)
      }
    } else {
      setEcheances(SEED_DATA)
    }
    setLoaded(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(echeances))
    }
  }, [echeances, loaded])

  // Grouped by project, sorted by date within each group
  const grouped = useMemo(() => {
    const groups: Record<string, { projetId: string; projetNom: string; projetCode: string; echeances: Echeance[]; total: number }> = {}
    for (const e of echeances) {
      if (!groups[e.projetId]) {
        groups[e.projetId] = { projetId: e.projetId, projetNom: e.projetNom, projetCode: e.projetCode, echeances: [], total: 0 }
      }
      groups[e.projetId].echeances.push(e)
      groups[e.projetId].total += e.montant
    }
    // Sort echéances within each group by date
    for (const g of Object.values(groups)) {
      g.echeances.sort((a, b) => a.date.localeCompare(b.date))
    }
    // Sort groups by total descending
    return Object.values(groups).sort((a, b) => b.total - a.total)
  }, [echeances])

  // KPIs
  const totalAEncaisser = useMemo(
    () => echeances.filter((e) => e.statut !== 'Payee').reduce((s, e) => s + e.montant, 0),
    [echeances],
  )
  const montantEnRetard = useMemo(
    () => echeances.filter((e) => e.statut === 'En retard').reduce((s, e) => s + e.montant, 0),
    [echeances],
  )
  const prochaineEcheance = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const futures = echeances.filter((e) => e.date >= today && e.statut !== 'Payee').sort((a, b) => a.date.localeCompare(b.date))
    return futures.length > 0 ? futures[0] : null
  }, [echeances])

  // Handlers
  function handleChangeStatut(id: string, newStatut: Statut) {
    setEcheances((prev) => prev.map((e) => (e.id === id ? { ...e, statut: newStatut } : e)))
  }

  function handleDelete(id: string) {
    setEcheances((prev) => prev.filter((e) => e.id !== id))
  }

  function toggleGroup(projetId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(projetId)) {
        next.delete(projetId)
      } else {
        next.add(projetId)
      }
      return next
    })
  }

  function handleAdd() {
    if (!formProjetId || !formMontant || !formDate) return
    const projet = PROJETS.find((p) => p.id === formProjetId)
    const newEcheance: Echeance = {
      id: generateId(),
      projetId: formProjetId,
      projetNom: projet?.projet ?? formProjetId,
      projetCode: projet?.code ?? '???',
      type: formType,
      montant: parseFloat(formMontant),
      date: formDate,
      statut: formStatut,
      notes: formNotes,
    }
    setEcheances((prev) => [...prev, newEcheance])
    setFormProjetId('')
    setFormType('Situation')
    setFormMontant('')
    setFormDate('')
    setFormStatut('A emettre')
    setFormNotes('')
    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <>
      <Topbar title="Échéancier" subtitle="Suivi des échéances de paiement par projet" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total à encaisser" value={fmt(totalAEncaisser)} source="ÉCHÉANCIER · statut ≠ Payée" accent="warning" />
        <KpiCard label="Montant en retard" value={fmt(montantEnRetard)} source="ÉCHÉANCIER · statut = En retard" accent="danger" />
        <KpiCard
          label="Prochaine échéance"
          value={prochaineEcheance ? `${formatDate(prochaineEcheance.date)}` : '--'}
          source={prochaineEcheance ? `${prochaineEcheance.projetNom} · ${fmt(prochaineEcheance.montant)}` : 'Aucune échéance à venir'}
          accent="info"
        />
      </div>

      {/* Add button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-mono text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Plus size={16} />
          Ajouter une échéance
        </button>
      </div>

      {/* Add form (inline) */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Nouvelle échéance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Projet */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Projet</label>
              <select
                value={formProjetId}
                onChange={(e) => setFormProjetId(e.target.value)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-sans text-[var(--text-primary)]"
              >
                <option value="">Sélectionner...</option>
                {PROJETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.projet}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as TypeEcheance)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-sans text-[var(--text-primary)]"
              >
                {TYPES_ECHEANCE.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Montant */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Montant HT</label>
              <input
                type="number"
                value={formMontant}
                onChange={(e) => setFormMontant(e.target.value)}
                placeholder="0"
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-mono text-[var(--text-primary)]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-mono text-[var(--text-primary)]"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Statut</label>
              <select
                value={formStatut}
                onChange={(e) => setFormStatut(e.target.value as Statut)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-sans text-[var(--text-primary)]"
              >
                <option value="A emettre">A émettre</option>
                <option value="Emise">Émise</option>
                <option value="Payee">Payée</option>
                <option value="En retard">En retard</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Notes</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optionnel"
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-sans text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!formProjetId || !formMontant || !formDate}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-mono text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              Ajouter
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-mono text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Grouped by project */}
      <div className="space-y-4">
        {grouped.length === 0 && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-8 text-center text-[var(--text-secondary)] font-sans">
            Aucune échéance. Cliquez sur &laquo; Ajouter une échéance &raquo; pour commencer.
          </div>
        )}

        {grouped.map((group) => {
          const isCollapsed = collapsedGroups.has(group.projetId)
          return (
            <div key={group.projetId} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              {/* Project group header */}
              <button
                onClick={() => toggleGroup(group.projetId)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight size={16} className="text-[var(--text-secondary)] shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--text-secondary)] shrink-0" />
                )}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30">
                  {group.projetCode}
                </span>
                <span className="font-serif text-sm text-[var(--text-primary)] truncate">{group.projetNom}</span>
                <span className="ml-auto font-mono text-sm text-[var(--text-primary)] shrink-0">{fmt(group.total)}</span>
                <span className="font-mono text-xs text-[var(--text-secondary)] shrink-0">
                  ({group.echeances.length} échéance{group.echeances.length > 1 ? 's' : ''})
                </span>
              </button>

              {/* Echéances list */}
              {!isCollapsed && (
                <div className="border-t border-[var(--border)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono text-xs">
                        <th className="text-left px-4 py-2">Type</th>
                        <th className="text-right px-4 py-2">Montant HT</th>
                        <th className="text-center px-4 py-2">Date</th>
                        <th className="text-center px-4 py-2">Statut</th>
                        <th className="text-left px-4 py-2">Notes</th>
                        <th className="text-center px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.echeances.map((e) => (
                        <tr key={e.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)]">
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-mono ${TYPE_STYLES[e.type]}`}>
                              {e.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-right text-[var(--text-primary)]">{fmt(e.montant)}</td>
                          <td className="px-4 py-2.5 font-mono text-center text-[var(--text-secondary)]">{formatDate(e.date)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <select
                              value={e.statut}
                              onChange={(ev) => handleChangeStatut(e.id, ev.target.value as Statut)}
                              className={`inline-flex px-2 py-0.5 rounded border text-xs font-mono cursor-pointer appearance-none text-center ${STATUT_STYLES[e.statut]}`}
                            >
                              <option value="A emettre">A émettre</option>
                              <option value="Emise">Émise</option>
                              <option value="Payee">Payée</option>
                              <option value="En retard">En retard</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 font-sans text-[var(--text-secondary)] max-w-[200px] truncate">{e.notes || '--'}</td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Source tag */}
      <div className="mt-4 px-1">
        <SourceTag source="localStorage · echeances" detail="Données stockées localement dans le navigateur. Sera synchronisé avec le Google Sheets." />
      </div>
    </>
  )
}
