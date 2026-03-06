'use client'

import { useState } from 'react'
import { FolderOpen, FileSpreadsheet, Mail, ClipboardList, Check } from 'lucide-react'

const PHASES = ['DIAG', 'ESQ', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'] as const
const MARCHES = ['Public', 'Privé', 'Semi-public', 'Concours'] as const
const RESPONSABLES = ['Amélie', 'Régis', 'Les deux'] as const

const RECENTS = [
  { nom: 'Roanne - Musée Dechelette', date: '2026-02-27' },
  { nom: 'AJN Falcon Nest', date: '2026-02-14' },
  { nom: 'RTE : Base et Avenant', date: '2026-01-20' },
]

export default function OnboardingForm() {
  const [nom, setNom] = useState('')
  const [client, setClient] = useState('')
  const [marche, setMarche] = useState<string>('Public')
  const [honoraires, setHonoraires] = useState('')
  const [responsable, setResponsable] = useState<string>('Les deux')
  const [phase, setPhase] = useState<string>('ESQ')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tried, setTried] = useState(false)

  const isValid = nom.trim() !== '' && client.trim() !== ''

  const handleSubmit = () => {
    setTried(true)
    if (!isValid) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setTried(false)
      setNom(''); setClient(''); setHonoraires(''); setDate(''); setNotes('')
      setMarche('Public'); setResponsable('Les deux'); setPhase('ESQ')
    }, 3000)
  }

  const inputClass = (valid: boolean) =>
    `w-full rounded-lg border ${
      tried && !valid ? 'border-red' : 'border-border-custom'
    } bg-bg-primary px-4 py-2.5 font-sans text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-gold/50`

  const ITEMS = [
    {
      icon: FolderOpen,
      title: 'Dossier Drive',
      desc: `2026_ACTE1_[NomProjet]_[Client]/ avec sous-dossiers : 01_Administratif / 02_Etudes / 03_Chantier / 04_Facturation`,
    },
    {
      icon: FileSpreadsheet,
      title: 'Fiche projet Google Sheet',
      desc: 'Phases MOP pré-structurées, colonnes : Phase / Montant / Date prévue / Date réelle / Facture n°',
    },
    {
      icon: Mail,
      title: 'Email récapitulatif',
      desc: 'Envoyé aux deux associées avec résumé du projet',
    },
    {
      icon: ClipboardList,
      title: 'Ligne Forecast',
      desc: 'Ajoutée automatiquement au FORECAST 2026 avec honoraires et état "En cours"',
    },
  ]

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Form */}
      <div className="lg:col-span-3 space-y-5">
        {submitted && (
          <div className="rounded-lg border border-green/40 bg-green/5 p-4 flex items-start gap-3">
            <Check className="text-green mt-0.5 shrink-0" size={18} />
            <p className="text-sm text-green font-sans">
              Projet &laquo;{nom}&raquo; créé — Dossier Drive généré · Fiche projet prête · Régis notifié · Ligne Forecast ajoutée
            </p>
          </div>
        )}

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Nom du projet *</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Musée de Grenoble — Scénographie salle permanente"
            className={inputClass(nom.trim() !== '')}
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Client / Maître d&apos;ouvrage *</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Ville de Grenoble"
            className={inputClass(client.trim() !== '')}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-text-muted mb-1.5">Type de marché</label>
            <select
              value={marche}
              onChange={(e) => setMarche(e.target.value)}
              className={inputClass(true)}
            >
              {MARCHES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs text-text-muted mb-1.5">Honoraires HT (€)</label>
            <input
              type="number"
              value={honoraires}
              onChange={(e) => setHonoraires(e.target.value)}
              placeholder="45000"
              className={inputClass(true)}
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Responsable principal</label>
          <select
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className={inputClass(true)}
          >
            {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Phase de départ</label>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs border transition-colors ${
                  phase === p
                    ? 'bg-gold/20 text-gold border-gold/30'
                    : 'bg-bg-primary text-text-muted border-border-custom hover:bg-bg-hover'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Date de démarrage prévue</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass(true)}
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-text-muted mb-1.5">Notes / Contexte</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Contacts MOA, particularités, lien AO..."
            className={inputClass(true) + ' resize-none'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={tried && !isValid}
          className="w-full rounded-lg bg-gold py-3 font-sans text-sm font-semibold text-bg-primary hover:bg-gold/90 transition-colors disabled:opacity-40"
        >
          Créer le projet
        </button>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-lg border border-border-custom bg-bg-card p-5">
          <h3 className="font-serif text-lg text-text-main mb-4">Ce qui sera créé automatiquement</h3>
          <div className="space-y-4">
            {ITEMS.map((item, i) => (
              <div key={i} className="flex gap-3">
                <item.icon size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm font-medium text-text-main">{item.title}</p>
                  <p className="font-mono text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-custom bg-bg-card p-5">
          <h3 className="font-serif text-base text-text-main mb-3">Derniers projets créés</h3>
          <div className="space-y-2.5">
            {RECENTS.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="font-sans text-sm text-text-main truncate">{r.nom}</p>
                <span className="font-mono text-[11px] text-text-muted shrink-0 ml-2">{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
