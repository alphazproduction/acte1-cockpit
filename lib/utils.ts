import { type Projet, PROJETS, MOIS_LABELS } from './data'

// ── Formatage montants ──────────────────────────────────────────

export function fmt(n: number): string {
  if (n === 0) return '\u2014'
  if (n >= 1000000) return `${(n / 1000000).toFixed(2).replace('.', ',')} M\u20AC`
  return `${n.toLocaleString('fr-FR')} \u20AC`
}

export function fmtK(n: number): string {
  if (n === 0) return '\u2014'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.', ',')}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k\u20AC`
  return `${n}\u20AC`
}

export function fmtPct(n: number): string {
  return `${Math.round(n)}%`
}

// ── Pondération mensuelle ───────────────────────────────────────

export const PONDERATIONS = [1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5] as const
export const SOMME_POIDS = PONDERATIONS.reduce((a, b) => a + b, 0) // 10.5
export const OBJECTIF_ANNUEL = 400000

export function objectifMois(moisIndex: number): number {
  return OBJECTIF_ANNUEL * (PONDERATIONS[moisIndex] / SOMME_POIDS)
}

export function objectifCumule(moisIndex: number): number {
  let total = 0
  for (let i = 0; i <= moisIndex; i++) total += objectifMois(i)
  return total
}

export function tempsEcoulePondere(moisIndex: number): number {
  let poidsPasses = 0
  for (let i = 0; i <= moisIndex; i++) poidsPasses += PONDERATIONS[i]
  return (poidsPasses / SOMME_POIDS) * 100
}

// ── Mois courant ────────────────────────────────────────────────

export const MOIS_COURANT_INDEX = 2 // Mars (0-indexed)

// ── Statuts projet ──────────────────────────────────────────────

export interface Statut {
  label: string
  color: string
  colorLight: string
  icon: string
}

export function getStatut(etat: string): Statut {
  const e = etat.toLowerCase()
  if (e.includes('en cours') || e.includes('validé par mail'))
    return { label: 'En cours', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', colorLight: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '\u25CF' }
  if (e.includes('attente signature'))
    return { label: 'Attente signature', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', colorLight: 'text-blue-700 bg-blue-50 border-blue-200', icon: '\u25CE' }
  if (e.includes('attente contrat'))
    return { label: 'Attente contrat', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', colorLight: 'text-blue-700 bg-blue-50 border-blue-200', icon: '\u25CE' }
  if (e.includes('attente paiement'))
    return { label: 'Attente paiement', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', colorLight: 'text-amber-700 bg-amber-50 border-amber-200', icon: '\u25D1' }
  if (e.includes('attente gpa'))
    return { label: 'Attente réception', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', colorLight: 'text-amber-700 bg-amber-50 border-amber-200', icon: '\u25D1' }
  if (e.includes('attente os'))
    return { label: 'Attente OS', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', colorLight: 'text-amber-700 bg-amber-50 border-amber-200', icon: '\u25D1' }
  if (e.includes('vérif') || e.includes('verif'))
    return { label: 'À vérifier', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', colorLight: 'text-amber-700 bg-amber-50 border-amber-200', icon: '\u25D1' }
  if (e.includes('mise à jour') || e.includes('mise a jour'))
    return { label: 'À mettre à jour', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', colorLight: 'text-amber-700 bg-amber-50 border-amber-200', icon: '\u25D1' }
  if (e.includes('gelé') || e.includes('gele'))
    return { label: 'Gelé', color: 'text-red-400 bg-red-400/10 border-red-400/30', colorLight: 'text-red-700 bg-red-50 border-red-200', icon: '\u26A0' }
  if (e.includes('stoppé') || e.includes('stoppe'))
    return { label: 'Arrêté', color: 'text-red-400 bg-red-400/10 border-red-400/30', colorLight: 'text-red-700 bg-red-50 border-red-200', icon: '\u26A0' }
  if (e.includes('reste le det'))
    return { label: 'Phases restantes', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', colorLight: 'text-blue-700 bg-blue-50 border-blue-200', icon: '\u25CC' }
  if (e.includes('attente fin aor'))
    return { label: 'Clôture en cours', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', colorLight: 'text-blue-700 bg-blue-50 border-blue-200', icon: '\u25CC' }
  return { label: 'Inconnu', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', colorLight: 'text-gray-600 bg-gray-50 border-gray-200', icon: '\u00B7' }
}

// ── Alertes ─────────────────────────────────────────────────────

export type NiveauAlerte = 'danger' | 'warning' | 'info'

export interface Alerte {
  niveau: NiveauAlerte
  projet: string
  montant: number
  message: string
  action: string
  source: string
}

export function getAlertes(): Alerte[] {
  return [
    { niveau: 'danger', projet: "Musée de l'Armée", montant: 30508, message: 'Gelé — 30 508\u20AC bloqués, aucune planification 2026', action: "Appeler le maître d'ouvrage cette semaine", source: 'PROJETS · ligne "Musée de l\'Armée" · col. etat' },
    { niveau: 'danger', projet: 'SGP Gare de Blanc-Mesnil', montant: 7600, message: 'Possiblement stoppé en 2024 — 7 600\u20AC à risque', action: 'Confirmer statut avec MOA avant clôture', source: 'PROJETS · col. etat' },
    { niveau: 'warning', projet: 'Manitou Suite', montant: 30625, message: 'Attente paiement — 30 625\u20AC sans planification 2026', action: 'Relance client à envoyer', source: 'PROJETS · col. etat + PREVISIONNEL 2026' },
    { niveau: 'warning', projet: 'Palais Bourbon Moatti', montant: 136000, message: 'Attente OS — 136 000\u20AC bloqués, seulement 3 600\u20AC planifiés', action: 'Suivre déblocage OS avec MOE', source: 'PROJETS · honoraires + PREVISIONNEL · total 2026' },
    { niveau: 'warning', projet: 'Nausicaa', montant: 98766, message: "98 766\u20AC d'honoraires — seulement 7 901\u20AC planifiés (8%)", action: 'Mettre à jour le planning de facturation', source: 'PROJETS · honoraires vs PREVISIONNEL · total' },
    { niveau: 'info', projet: 'Septembre 2026', montant: 0, message: 'Mois creux — aucune facturation planifiée', action: 'Anticiper avec les projets "Attente contrat"', source: 'PREVISIONNEL · col. Sep' },
    { niveau: 'info', projet: 'Insight : ACT2 + DET + AOR', montant: 19950, message: 'Attente signature contrat — 19 950\u20AC conditionnels', action: 'Relancer pour signature', source: 'PROJETS · col. etat' },
  ]
}

// ── Helpers ─────────────────────────────────────────────────────

export function getProjetsDuMois(moisIndex: number): Projet[] {
  return PROJETS
    .filter((p) => p.mois[moisIndex] > 0)
    .sort((a, b) => b.mois[moisIndex] - a.mois[moisIndex])
}

export function getTop3Mois(moisIndex: number): string[] {
  return getProjetsDuMois(moisIndex)
    .slice(0, 3)
    .map((p) => `${p.projet} : ${fmt(p.mois[moisIndex])}`)
}

export function getTop5Projets(): Projet[] {
  return [...PROJETS].sort((a, b) => b.reste - a.reste).slice(0, 5)
}

// ── Couleur bar en fonction du ratio réalisé/objectif ───────────

export function getBarColor(realise: number, objectif: number, isPast: boolean, isCurrent: boolean): string {
  if (isCurrent) return '#8b5cf6' // violet pour le mois courant
  if (isPast) {
    if (objectif === 0) return '#9ca3af40'
    const ratio = realise / objectif
    if (ratio >= 1) return '#10b98180'
    if (ratio >= 0.8) return '#f59e0b80'
    return '#ef444480'
  }
  return '#8b5cf640' // futur = violet clair
}
