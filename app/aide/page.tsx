'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, LayoutDashboard, CalendarRange, GanttChart, Receipt, Settings, ArrowRight, Database, Globe, BarChart3, Target, AlertTriangle, Palette, Hash, MousePointer } from 'lucide-react'
import { PONDERATIONS, objectifMois, fmt, fmtPct } from '@/lib/utils'
import { getObjectifGlobal, getNombreAssocies, getObjectifAnnuel } from '@/lib/config'
import { MOIS_LABELS } from '@/lib/data'
import Topbar from '@/components/Topbar'

function Section({ id, icon: Icon, title, children, defaultOpen = false }: { id: string; icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bg-hover)] transition-colors">
        <Icon size={20} className="text-[var(--accent)] shrink-0" />
        <h3 className="font-serif text-lg text-[var(--text-primary)] flex-1">{title}</h3>
        {open ? <ChevronDown size={18} className="text-[var(--text-secondary)]" /> : <ChevronRight size={18} className="text-[var(--text-secondary)]" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-[var(--border)]">{children}</div>}
    </div>
  )
}

function FlowArrow() {
  return <ArrowRight size={16} className="text-[var(--accent)] shrink-0 mx-1" />
}

function FlowBox({ label, sub, color = 'accent' }: { label: string; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    accent: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    warning: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    danger: 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    info: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    muted: 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${colors[color]}`}>
      <p className="font-mono text-xs font-semibold">{label}</p>
      {sub && <p className="font-mono text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  )
}

function ColorDot({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${color}`} />
      <div>
        <p className="font-sans text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="font-sans text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
    </div>
  )
}

function KpiExplain({ label, formula, example, source }: { label: string; formula: string; example: string; source: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-4">
      <p className="font-sans text-sm font-medium text-[var(--accent)]">{label}</p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded shrink-0">Formule</span>
          <p className="font-mono text-xs text-[var(--text-primary)]">{formula}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded shrink-0">Exemple</span>
          <p className="font-mono text-xs text-[var(--text-secondary)]">{example}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">Source</span>
          <p className="font-mono text-xs text-[var(--text-secondary)]">{source}</p>
        </div>
      </div>
    </div>
  )
}

export default function AidePage() {
  return (
    <>
      <Topbar title="Aide" subtitle="Guide complet du cockpit de pilotage ACTE 1" />

      {/* Sommaire */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-6">
        <h3 className="font-serif text-lg text-[var(--text-primary)] mb-3">Sommaire</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { id: 'vue-ensemble', icon: Globe, label: 'Vue d\'ensemble' },
            { id: 'donnees', icon: Database, label: 'D\'où viennent les données ?' },
            { id: 'logique', icon: Target, label: 'Logique de calcul' },
            { id: 'couleurs', icon: Palette, label: 'Codes couleur' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'forecast', icon: CalendarRange, label: 'Forecast' },
            { id: 'trigrammes', icon: Hash, label: 'Trigrammes projets' },
            { id: 'planning', icon: GanttChart, label: 'Planning' },
            { id: 'creances', icon: Receipt, label: 'Créances' },
            { id: 'parametres', icon: Settings, label: 'Paramètres' },
            { id: 'alertes', icon: AlertTriangle, label: 'Alertes' },
            { id: 'interactions', icon: MousePointer, label: 'Interactions' },
          ].map((item) => (
            <a key={item.id} href={`#${item.id}`} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
              <item.icon size={14} className="text-[var(--accent)]" />
              <span className="font-sans text-sm text-[var(--text-primary)]">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">

        {/* ── VUE D'ENSEMBLE ── */}
        <Section id="vue-ensemble" icon={Globe} title="Vue d'ensemble" defaultOpen>
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Le cockpit de pilotage ACTE 1 est un outil de visualisation financière conçu pour suivre en temps réel
              la facturation prévisionnelle de l'agence. Il permet aux associés de piloter leur
              activité à partir d'un objectif annuel de <strong className="text-[var(--text-primary)]">{fmt(getObjectifGlobal())} HT par associé</strong> (paramétrable).
            </p>

            {/* Schéma architecture */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Architecture des données</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <FlowBox label="Google Sheets" sub="9 onglets" color="info" />
                <FlowArrow />
                <FlowBox label="Apps Script API" sub="doGet / doPost" color="muted" />
                <FlowArrow />
                <FlowBox label="Cockpit Next.js" sub="5 vues + Aide" color="accent" />
                <FlowArrow />
                <FlowBox label="Vercel" sub="Auto-deploy" color="success" />
              </div>
            </div>

            {/* Les 6 vues */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Les 6 vues du cockpit</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', desc: 'KPIs, progression, alertes, graphiques' },
                  { icon: CalendarRange, label: 'Forecast', desc: 'Tableau mensuel par projet' },
                  { icon: GanttChart, label: 'Planning', desc: 'Dates initiales vs révisées' },
                  { icon: Receipt, label: 'Créances', desc: 'Factures et recouvrement' },
                  { icon: Settings, label: 'Paramètres', desc: 'Objectif, pondérations, API' },
                  { icon: Globe, label: 'Aide', desc: 'Ce guide (vous êtes ici)' },
                ].map((v) => (
                  <div key={v.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                    <v.icon size={16} className="text-[var(--accent)] mb-1.5" />
                    <p className="font-sans text-sm font-medium text-[var(--text-primary)]">{v.label}</p>
                    <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-0.5">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── D'OÙ VIENNENT LES DONNÉES ── */}
        <Section id="donnees" icon={Database} title="D'où viennent les données ?">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Les données du cockpit proviennent d'un <strong className="text-[var(--text-primary)]">Google Sheets</strong> structuré en 9 onglets.
              Actuellement, le cockpit fonctionne en mode <strong className="text-[var(--warning)]">POC (données statiques)</strong> intégrées dans le code.
              Une fois connecté au Google Sheet via l'API Apps Script, les données seront synchronisées en temps réel.
            </p>

            {/* Les 9 onglets */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Structure du Google Sheets (9 onglets)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'CONFIG', desc: 'Objectif annuel, associés, devise', color: 'bg-gray-100 dark:bg-gray-800' },
                  { name: 'PROJETS', desc: 'id, nom, client, statut, honoraires', color: 'bg-amber-50 dark:bg-amber-900/20' },
                  { name: 'PHASES', desc: 'Phases MOP par projet (DIAG→AOR)', color: 'bg-blue-50 dark:bg-blue-900/20' },
                  { name: 'PREVISIONNEL', desc: 'Montants mensuels par projet/année', color: 'bg-amber-50 dark:bg-amber-900/20' },
                  { name: 'ECHEANCIER', desc: 'Dates de facturation prévues', color: 'bg-orange-50 dark:bg-orange-900/20' },
                  { name: 'FACTURES', desc: 'Factures émises et leur statut', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { name: 'PIPELINE', desc: 'Projets en prospection', color: 'bg-purple-50 dark:bg-purple-900/20' },
                  { name: 'CONTACTS', desc: 'Contacts liés aux projets', color: 'bg-blue-50 dark:bg-blue-900/20' },
                  { name: 'CHARGES', desc: 'Jours travaillés par associé', color: 'bg-gray-100 dark:bg-gray-800' },
                ].map((tab) => (
                  <div key={tab.name} className={`rounded p-2.5 ${tab.color}`}>
                    <p className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{tab.name}</p>
                    <p className="font-sans text-[10px] text-[var(--text-secondary)] mt-0.5">{tab.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flux données */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Flux de données pour chaque vue</p>
              <div className="space-y-2">
                {[
                  { vue: 'Dashboard', sources: ['PREVISIONNEL', 'PROJETS', 'CONFIG'], desc: 'Totaux mensuels cumulés vs objectif pondéré' },
                  { vue: 'Forecast', sources: ['PREVISIONNEL', 'PROJETS'], desc: 'Détail mensuel par projet, trigramme, avancement' },
                  { vue: 'Planning', sources: ['PHASES', 'PROJETS'], desc: 'Dates début/fin par projet, delta en mois' },
                  { vue: 'Créances', sources: ['FACTURES'], desc: 'Montants, ancienneté, statut de chaque facture' },
                  { vue: 'Alertes', sources: ['PROJETS', 'PREVISIONNEL'], desc: 'Détection automatique des anomalies' },
                ].map((item) => (
                  <div key={item.vue} className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-[var(--accent)] w-20 shrink-0">{item.vue}</span>
                    <span className="text-[var(--text-secondary)]">&larr;</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.sources.map((s) => (
                        <span key={s} className="font-mono text-[10px] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    <span className="font-sans text-[11px] text-[var(--text-secondary)] hidden sm:inline">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── LOGIQUE DE CALCUL ── */}
        <Section id="logique" icon={Target} title="Logique de calcul">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              L'objectif annuel est de <strong className="text-[var(--text-primary)]">X k€</strong> par associé (configurable dans Paramètres, actuellement {fmt(getObjectifGlobal())}).
              Cet objectif est réparti sur 12 mois avec un système de <strong className="text-[var(--text-primary)]">pondération</strong> :
              les mois d'activité réduite (juillet, août, décembre) comptent pour 0.5, les autres pour 1.0.
            </p>

            {/* Pondérations visuelles */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Pondération mensuelle — Somme = 10.5</p>
              <div className="grid grid-cols-6 lg:grid-cols-12 gap-1.5">
                {MOIS_LABELS.map((m, i) => (
                  <div key={i} className={`text-center rounded p-2 ${PONDERATIONS[i] < 1 ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30' : 'bg-[var(--bg-primary)] border border-[var(--border)]'}`}>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)]">{m}</p>
                    <p className={`font-mono text-sm font-bold mt-0.5 ${PONDERATIONS[i] < 1 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>&times;{PONDERATIONS[i]}</p>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)] mt-0.5">{fmt(Math.round(objectifMois(i)))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formules */}
            <div className="grid sm:grid-cols-2 gap-3">
              <KpiExplain
                label="Objectif du mois"
                formula="Objectif_annuel × (Poids_mois / 10.5)"
                example={`Mars (×1) = ${fmt(getObjectifGlobal())} × (1 / 10.5) = ${fmt(Math.round(objectifMois(2)))}`}
                source="CONFIG · objectif_annuel + pondérations"
              />
              <KpiExplain
                label="Objectif cumulé YTD"
                formula="Somme des objectifs mensuels de Jan au mois courant"
                example={`Jan–Mar = ${fmt(Math.round(objectifMois(0)))} × 3 = ${fmt(Math.round(objectifMois(0) * 3))}`}
                source="Calculé automatiquement"
              />
              <KpiExplain
                label="Taux de réalisation"
                formula="Prévu_cumulé / Objectif_cumulé × 100"
                example="183 248 / 114 286 = 160%"
                source="PREVISIONNEL cumulé vs CONFIG"
              />
              <KpiExplain
                label="Projection annuelle"
                formula={`Taux_réalisation × Objectif_annuel (${fmt(getObjectifGlobal())})`}
                example={`160% × ${fmt(getObjectifGlobal())} = ${fmt(Math.round(getObjectifGlobal() * 1.6))}`}
                source="Extrapolation du rythme actuel"
              />
              <KpiExplain
                label="Temps pondéré écoulé"
                formula="Poids_passés / 10.5 × 100"
                example="Jan+Fév+Mar = 3 / 10.5 = 29%"
                source="Pondérations cumulées"
              />
              <KpiExplain
                label="Avancement projet"
                formula="Facturé_YTD / Total_2026 × 100"
                example="PALC : 9 565 / 50 655 = 19%"
                source="PREVISIONNEL · mois Jan–courant / total"
              />
            </div>
          </div>
        </Section>

        {/* ── CODES COULEUR ── */}
        <Section id="couleurs" icon={Palette} title="Codes couleur">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Le cockpit utilise un code couleur cohérent partout. Les couleurs sont liées au <strong className="text-[var(--text-primary)]">ratio réalisé / objectif</strong>.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-mono text-xs text-[var(--text-secondary)] mb-2">Barres et montants</p>
                <ColorDot color="bg-emerald-500" label="Vert — Au-dessus de l'objectif" desc="Le montant réalisé ≥ 100% de l'objectif pondéré du mois" />
                <ColorDot color="bg-amber-500" label="Orange — Zone de vigilance" desc="Entre 80% et 100% de l'objectif. Pas critique mais à surveiller" />
                <ColorDot color="bg-red-500" label="Rouge — En danger" desc="Moins de 80% de l'objectif. Action requise" />
                <ColorDot color="bg-violet-500" label="Violet — Mois courant / Objectif" desc="Le mois en cours est toujours violet. Les barres d'objectif aussi" />
                <ColorDot color="bg-gray-300 dark:bg-gray-600" label="Gris — Mois passés" desc="Les mois déjà écoulés sont atténués pour focaliser sur le présent" />
              </div>
              <div className="space-y-1">
                <p className="font-mono text-xs text-[var(--text-secondary)] mb-2">Statuts projets</p>
                <ColorDot color="bg-emerald-500" label="● En cours" desc="Projet actif, facturation en cours" />
                <ColorDot color="bg-blue-500" label="◎ Attente signature / contrat" desc="En attente de validation externe" />
                <ColorDot color="bg-amber-500" label="◑ En attente (OS, paiement, vérif)" desc="Bloqué côté client ou à vérifier en interne" />
                <ColorDot color="bg-red-500" label="⚠ Gelé / Arrêté" desc="Projet à risque, facturation probablement compromise" />
                <ColorDot color="bg-blue-400" label="◌ Phases restantes / Clôture" desc="Fin de projet, dernières phases en cours" />
              </div>
            </div>

            {/* Schéma visuel */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Exemple de lecture du graphique mensuel</p>
              <div className="flex items-end gap-1 h-24">
                {[
                  { h: 60, color: 'bg-emerald-500/60', label: 'Jan', desc: '≥100%' },
                  { h: 85, color: 'bg-emerald-500/60', label: 'Fév', desc: '≥100%' },
                  { h: 95, color: 'bg-violet-500', label: 'Mar', desc: 'Courant' },
                  { h: 50, color: 'bg-violet-500/30', label: 'Avr', desc: 'Futur' },
                  { h: 70, color: 'bg-violet-500/30', label: 'Mai', desc: 'Futur' },
                  { h: 55, color: 'bg-violet-500/30', label: 'Jun', desc: 'Futur' },
                  { h: 30, color: 'bg-violet-500/30', label: 'Jul', desc: '×0.5' },
                  { h: 20, color: 'bg-violet-500/30', label: 'Aoû', desc: '×0.5' },
                  { h: 5, color: 'bg-red-500/30', label: 'Sep', desc: '0 €' },
                  { h: 45, color: 'bg-violet-500/30', label: 'Oct', desc: 'Futur' },
                  { h: 35, color: 'bg-violet-500/30', label: 'Nov', desc: 'Futur' },
                  { h: 15, color: 'bg-violet-500/30', label: 'Déc', desc: '×0.5' },
                ].map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={`w-full rounded-t ${bar.color}`} style={{ height: `${bar.h}%` }} />
                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">{bar.label}</span>
                    <span className="font-mono text-[7px] text-[var(--text-secondary)] opacity-60">{bar.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── DASHBOARD ── */}
        <Section id="dashboard" icon={LayoutDashboard} title="Dashboard — Vue synthétique">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Le dashboard est la page d'accueil. Il donne une vue d'ensemble instantanée de la santé financière de l'agence.
            </p>

            {/* 4 KPIs */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Les 4 indicateurs clés (KPI)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'CA prévu YTD', desc: 'Somme des montants prévisionnels du 1er janvier au mois courant inclus', source: 'PREVISIONNEL · Jan à Mars', color: 'border-emerald-200 dark:border-emerald-500/30' },
                  { label: 'Objectif YTD', desc: 'Somme des objectifs pondérés du 1er janvier au mois courant', source: 'CONFIG × pondérations cumulées', color: 'border-violet-200 dark:border-violet-500/30' },
                  { label: 'Projection annuelle', desc: 'Si le rythme actuel se maintient, combien sera facturé sur l\'année', source: `Taux réalisation × ${fmt(getObjectifGlobal())}`, color: 'border-amber-200 dark:border-amber-500/30' },
                  { label: 'Reste à facturer', desc: 'Total des honoraires de tous les projets encore à facturer', source: 'PROJETS · col. honoraires_ht', color: 'border-blue-200 dark:border-blue-500/30' },
                ].map((kpi) => (
                  <div key={kpi.label} className={`rounded-lg border ${kpi.color} bg-[var(--bg-primary)] p-3`}>
                    <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">{kpi.label}</p>
                    <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-1">{kpi.desc}</p>
                    <p className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 mt-1.5">Source : {kpi.source}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progression */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Double barre de progression</p>
              <div className="space-y-3">
                <div>
                  <p className="font-sans text-xs text-[var(--text-secondary)] mb-1">Temps pondéré écoulé (violet clair)</p>
                  <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500/30 w-[29%]" />
                  </div>
                  <p className="font-mono text-[9px] text-[var(--text-secondary)] mt-0.5">= Combien de l'année est « passé » en tenant compte des pondérations (29% en mars)</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-[var(--text-secondary)] mb-1">Objectif réalisé (vert/orange/rouge selon performance)</p>
                  <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[100%]" />
                  </div>
                  <p className="font-mono text-[9px] text-[var(--text-secondary)] mt-0.5">= Part du CA prévu par rapport à l'objectif cumulé. Vert = en avance, orange = légèrement en retard</p>
                </div>
              </div>
              <p className="font-sans text-xs text-[var(--text-secondary)] mt-3 p-2 bg-[var(--bg-primary)] rounded">
                <strong>Lecture :</strong> Si la barre verte dépasse la barre violette, vous êtes en avance sur l'objectif. Si elle est en dessous, vous êtes en retard.
              </p>
            </div>

            {/* Graphiques */}
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Deux modes de graphique</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-[var(--accent)]" />
                    <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">Vue Mensuel</p>
                  </div>
                  <p className="font-sans text-[11px] text-[var(--text-secondary)]">
                    Barres par mois. Barres violettes semi-transparentes = objectif. Barres pleines = prévu.
                    Le tooltip affiche le détail et le top 3 des projets du mois.
                  </p>
                </div>
                <div className="rounded border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-emerald-500" />
                    <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">Vue Consolidé (YTD)</p>
                  </div>
                  <p className="font-sans text-[11px] text-[var(--text-secondary)]">
                    Courbes cumulées. Vert = prévu cumulé. Violet pointillé = objectif cumulé.
                    Orange pointillé = projection si le rythme actuel se maintient.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── FORECAST ── */}
        <Section id="forecast" icon={CalendarRange} title="Forecast — Tableau détaillé">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Le forecast affiche tous les projets actifs avec leur planification mensuelle. C'est la vue la plus détaillée.
            </p>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Comment lire le tableau</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded shrink-0">PAL</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Trigramme</strong> — Code unique du projet. Survolez pour voir le détail complet.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--warning)] shrink-0">34%</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">% Avancement</strong> — Part du CA 2026 déjà réalisée (mois passés / total 2026)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)] font-semibold shrink-0">12k€</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Montant violet</strong> — Mois courant (mars). C'est le montant le plus important à suivre.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--text-secondary)] opacity-50 shrink-0">10k€</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Montant grisé</strong> — Mois passé. Le montant a normalement été facturé.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--success)] shrink-0">5k€</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Montant vert</strong> — Mois futur, montant modéré (&lt; 10k€)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)] shrink-0">15k€</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Montant violet futur</strong> — Mois futur, montant important (&ge; 10k€)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-[var(--border)] shrink-0">—</span>
                  <p className="font-sans text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Tiret</strong> — Aucune facturation prévue ce mois</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Ligne TOTAL (pied de tableau)</p>
              <p className="font-sans text-xs text-[var(--text-secondary)]">
                La ligne TOTAL additionne tous les montants de chaque mois. Elle est <strong className="text-[var(--success)]">verte</strong> si
                le total dépasse l'objectif pondéré du mois, <strong className="text-[var(--warning)]">orange</strong> entre 80-100%,
                et <strong className="text-[var(--danger)]">rouge</strong> en dessous de 80%. La ligne en dessous affiche l'objectif pondéré pour comparaison.
              </p>
            </div>
          </div>
        </Section>

        {/* ── TRIGRAMMES ── */}
        <Section id="trigrammes" icon={Hash} title="Trigrammes projets">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Chaque projet a un <strong className="text-[var(--text-primary)]">code court de 2 à 4 caractères</strong> (trigramme)
              pour l'identifier rapidement dans le tableau. Le nom complet étant souvent long, le trigramme permet de gagner de la place.
            </p>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Exemples de trigrammes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { code: 'PAL', nom: 'PALC - Chalons - Moatti' },
                  { code: 'RTE', nom: 'RTE : Base et Avenant' },
                  { code: 'AIR', nom: 'AIRBUS - B25 - MOE' },
                  { code: 'BOB', nom: 'Cinéma Bobigny - Suite' },
                  { code: 'NAU', nom: 'Nausicaa' },
                  { code: 'PBM', nom: 'Palais Bourbon Moatti' },
                ].map((p) => (
                  <div key={p.code} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded shrink-0">{p.code}</span>
                    <span className="font-sans text-[11px] text-[var(--text-secondary)] truncate">{p.nom}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Que montre le tooltip au survol ?</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[var(--text-secondary)]">
                <p>Nom complet du projet</p>
                <p>Statut actuel (En cours, Gelé, etc.)</p>
                <p>Honoraires totaux</p>
                <p>Montant prévu 2026</p>
                <p>Reste à facturer</p>
                <p>Barre de progression (avancement %)</p>
                <p>Sparkline des 12 mois</p>
                <p>État détaillé (texte libre)</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── PLANNING ── */}
        <Section id="planning" icon={GanttChart} title="Planning — Suivi des délais">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              La vue Planning compare les <strong className="text-[var(--text-primary)]">dates de fin initiales</strong> avec les
              <strong className="text-[var(--text-primary)]"> dates révisées</strong>. Tout glissement impacte la trésorerie.
            </p>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Colonnes du tableau</p>
              <div className="space-y-1.5 text-xs font-sans text-[var(--text-secondary)]">
                <p><strong className="text-[var(--text-primary)]">Projet</strong> — Nom du projet</p>
                <p><strong className="text-[var(--text-primary)]">Statut</strong> — En cours, Attente OS, etc.</p>
                <p><strong className="text-[var(--text-primary)]">Honoraires</strong> — Montant total des honoraires</p>
                <p><strong className="text-[var(--text-primary)]">Début</strong> — Date de début prévue</p>
                <p><strong className="text-[var(--text-primary)]">Fin initiale</strong> — Date de fin initialement prévue au contrat</p>
                <p><strong className="text-[var(--text-primary)]">Fin révisée</strong> — Date de fin actualisée (modifiable au clic)</p>
                <p><strong className="text-[var(--text-primary)]">Delta</strong> — Écart en mois. <span className="text-[var(--danger)]">+N mois</span> = retard, <span className="text-[var(--success)]">-N mois</span> = avance</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── CRÉANCES ── */}
        <Section id="creances" icon={Receipt} title="Créances — Recouvrement">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Le suivi des créances permet de surveiller les factures émises et leur recouvrement.
              L'ancienneté est colorée selon le retard.
            </p>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Seuils d'ancienneté</p>
              <div className="space-y-2">
                <ColorDot color="bg-gray-400" label="0 – 30 jours" desc="Facture récente, délai de paiement normal" />
                <ColorDot color="bg-amber-500" label="31 – 60 jours" desc="Dépassement du délai. Relance à prévoir" />
                <ColorDot color="bg-red-500" label="Plus de 60 jours" desc="En retard. Relance urgente nécessaire" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── PARAMÈTRES ── */}
        <Section id="parametres" icon={Settings} title="Paramètres — Configuration">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              La page Paramètres permet de configurer l'objectif annuel, visualiser les pondérations,
              et <strong className="text-[var(--text-primary)]">connecter le cockpit au Google Sheets</strong>.
            </p>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
              <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Connexion Google Sheets — étapes</p>
              <ol className="space-y-2 text-xs font-sans text-[var(--text-secondary)] list-decimal list-inside">
                <li>Ouvrir le Google Sheets avec le script Apps Script</li>
                <li>Extensions &rarr; Apps Script &rarr; ouvrir l'éditeur</li>
                <li>Exécuter <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">setupComplet()</code> pour créer les 9 onglets</li>
                <li>Exécuter <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">importerDonnees()</code> pour insérer les données</li>
                <li>Déployer &rarr; Nouveau déploiement &rarr; Application Web &rarr; Accès : Tout le monde</li>
                <li>Copier l'URL du déploiement</li>
                <li>Coller dans Paramètres &rarr; Connexion Google Sheets</li>
              </ol>
            </div>
          </div>
        </Section>

        {/* ── ALERTES ── */}
        <Section id="alertes" icon={AlertTriangle} title="Alertes — Détection des anomalies">
          <div className="mt-4 space-y-4">
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              Les alertes sont générées automatiquement en analysant les données. Elles apparaissent sur le Dashboard.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-3">
                <p className="font-mono text-[10px] font-bold text-red-700 dark:text-red-400">DANGER</p>
                <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-1">Projet gelé ou arrêté avec des montants significatifs bloqués</p>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-3">
                <p className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">ATTENTION</p>
                <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-1">Écart important entre honoraires et montant planifié, ou attente prolongée</p>
              </div>
              <div className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-3">
                <p className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400">INFO</p>
                <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-1">Mois sans facturation, projets en attente de signature</p>
              </div>
            </div>

            <p className="font-sans text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] p-3 rounded border border-[var(--border)]">
              Chaque alerte indique la <strong>source exacte</strong> (onglet et colonne du Google Sheets) et une <strong>action recommandée</strong>.
            </p>
          </div>
        </Section>

        {/* ── INTERACTIONS ── */}
        <Section id="interactions" icon={MousePointer} title="Interactions — Ce que vous pouvez faire">
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {[
                { action: 'Survoler un trigramme', result: 'Affiche le détail complet du projet (honoraires, avancement, sparkline)', where: 'Forecast' },
                { action: 'Cliquer un trigramme', result: 'Affiche la fiche projet en modal (Dashboard, Top 5)', where: 'Dashboard' },
                { action: 'Modifier la date fin révisée', result: 'Recalcule le delta en mois automatiquement', where: 'Planning' },
                { action: 'Basculer Mensuel / Consolidé', result: 'Alterne entre vue barres et vue courbes cumulées', where: 'Dashboard' },
                { action: 'Rechercher un projet', result: 'Filtre par nom, trigramme ou statut', where: 'Forecast' },
                { action: 'Cliquer « Source »', result: 'Affiche l\'onglet et la colonne d\'origine de la donnée', where: 'Partout' },
                { action: 'Réduire la sidebar', result: 'Passe en mode icônes pour plus d\'espace', where: 'Sidebar' },
                { action: 'Basculer Light/Dark', result: 'Change le thème visuel (préférence sauvegardée)', where: 'Sidebar' },
                { action: 'Coller l\'URL API', result: 'Connecte le cockpit au Google Sheets pour la synchronisation', where: 'Paramètres' },
              ].map((item) => (
                <div key={item.action} className="flex items-start gap-3 py-1.5">
                  <span className="font-mono text-[9px] bg-[var(--accent)] text-white px-2 py-0.5 rounded shrink-0 mt-0.5">{item.where}</span>
                  <div>
                    <p className="font-sans text-sm text-[var(--text-primary)]">{item.action}</p>
                    <p className="font-sans text-[11px] text-[var(--text-secondary)]">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
        <p className="font-sans text-sm text-[var(--text-secondary)]">
          Cockpit développé par <strong className="text-[var(--text-primary)]">Alpha Z Production</strong> pour <strong className="text-[var(--accent)]">ACTE 1</strong>
        </p>
        <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
          Contact : ga@alpha-z.eu — Version POC · Mars 2026
        </p>
      </div>
    </>
  )
}
