'use client'

import { useState, useEffect, useMemo } from 'react'
import { PROJETS } from '@/lib/data'
import { fmt } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import KpiCard from '@/components/KpiCard'
import SourceTag from '@/components/SourceTag'
import { CalendarClock, Plus, Trash2, Check, AlertTriangle } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────

type Statut = 'A emettre' | 'Emise' | 'Payee' | 'En retard'

interface Echeance {
  id: string
  projetId: string
  projetNom: string
  montant: number
  date: string
  statut: Statut
  notes: string
}

// ── Constantes ──────────────────────────────────────────────────

const STATUT_LABELS: Record<Statut, string> = {
  'A emettre': 'A emettre',
  'Emise': 'Emise',
  'Payee': 'Payee',
  'En retard': 'En retard',
}

const STATUT_STYLES: Record<Statut, string> = {
  'A emettre': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30',
  'Emise': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  'Payee': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  'En retard': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
}

const STATUT_ICON: Record<Statut, typeof Check> = {
  'A emettre': CalendarClock,
  'Emise': AlertTriangle,
  'Payee': Check,
  'En retard': AlertTriangle,
}

const STORAGE_KEY = 'echeances'

const SEED_DATA: Echeance[] = [
  { id: 'seed-1', projetId: 'palc-chalons', projetNom: 'PALC - Chalons - Moatti', montant: 9565, date: '2026-04-15', statut: 'Emise', notes: '' },
  { id: 'seed-2', projetId: 'rte-base-avenant', projetNom: 'RTE : Base et Avenant', montant: 3675, date: '2026-03-31', statut: 'A emettre', notes: '' },
  { id: 'seed-3', projetId: 'airbus-b25', projetNom: 'AIRBUS - B25 - MOE', montant: 12255, date: '2026-03-15', statut: 'En retard', notes: '' },
  { id: 'seed-4', projetId: 'cinema-bobigny', projetNom: 'Cinema Bobigny', montant: 1850, date: '2026-02-28', statut: 'Payee', notes: '' },
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

export default function EcheancesPage() {
  const [echeances, setEcheances] = useState<Echeance[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formProjetId, setFormProjetId] = useState('')
  const [formMontant, setFormMontant] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formStatut, setFormStatut] = useState<Statut>('A emettre')
  const [formNotes, setFormNotes] = useState('')

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setEcheances(JSON.parse(raw))
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

  // Sorted by date (ascending)
  const sorted = useMemo(
    () => [...echeances].sort((a, b) => a.date.localeCompare(b.date)),
    [echeances],
  )

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

  function handleAdd() {
    if (!formProjetId || !formMontant || !formDate) return
    const projet = PROJETS.find((p) => p.id === formProjetId)
    const newEcheance: Echeance = {
      id: generateId(),
      projetId: formProjetId,
      projetNom: projet?.projet ?? formProjetId,
      montant: parseFloat(formMontant),
      date: formDate,
      statut: formStatut,
      notes: formNotes,
    }
    setEcheances((prev) => [...prev, newEcheance])
    setFormProjetId('')
    setFormMontant('')
    setFormDate('')
    setFormStatut('A emettre')
    setFormNotes('')
    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <>
      <Topbar title="Echeances" subtitle="Suivi des echeances de paiement" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total a encaisser" value={fmt(totalAEncaisser)} source="ECHEANCES · statut != Payee" accent="warning" />
        <KpiCard label="Montant en retard" value={fmt(montantEnRetard)} source="ECHEANCES · statut = En retard" accent="danger" />
        <KpiCard
          label="Prochaine echeance"
          value={prochaineEcheance ? `${formatDate(prochaineEcheance.date)}` : '--'}
          source={prochaineEcheance ? `${prochaineEcheance.projetNom} · ${fmt(prochaineEcheance.montant)}` : 'Aucune echeance a venir'}
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
          Ajouter une echeance
        </button>
      </div>

      {/* Add form (inline) */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="font-serif text-lg text-[var(--text-primary)] mb-4">Nouvelle echeance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Projet */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Projet</label>
              <select
                value={formProjetId}
                onChange={(e) => setFormProjetId(e.target.value)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-sans text-[var(--text-primary)]"
              >
                <option value="">Selectionner...</option>
                {PROJETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projet}
                  </option>
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
                <option value="A emettre">A emettre</option>
                <option value="Emise">Emise</option>
                <option value="Payee">Payee</option>
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

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono text-xs">
                <th className="text-left px-4 py-3">Projet</th>
                <th className="text-right px-4 py-3">Montant HT</th>
                <th className="text-center px-4 py-3">Date d&apos;echeance</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-center px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)] font-sans">
                    Aucune echeance. Cliquez sur &laquo; Ajouter une echeance &raquo; pour commencer.
                  </td>
                </tr>
              )}
              {sorted.map((e) => {
                const Icon = STATUT_ICON[e.statut]
                return (
                  <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-sans text-[var(--text-primary)]">{e.projetNom}</td>
                    <td className="px-4 py-3 font-mono text-right text-[var(--text-primary)]">{fmt(e.montant)}</td>
                    <td className="px-4 py-3 font-mono text-center text-[var(--text-secondary)]">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={e.statut}
                        onChange={(ev) => handleChangeStatut(e.id, ev.target.value as Statut)}
                        className={`inline-flex px-2 py-0.5 rounded border text-xs font-mono cursor-pointer appearance-none text-center ${STATUT_STYLES[e.statut]}`}
                      >
                        <option value="A emettre">A emettre</option>
                        <option value="Emise">Emise</option>
                        <option value="Payee">Payee</option>
                        <option value="En retard">En retard</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-sans text-[var(--text-secondary)] max-w-[200px] truncate">{e.notes || '--'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <SourceTag source="localStorage · echeances" detail="Donnees stockees localement dans le navigateur. Sera synchronise avec le Google Sheets." />
        </div>
      </div>
    </>
  )
}
