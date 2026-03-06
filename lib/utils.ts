import { type Projet, PROJETS, MOIS_LABELS } from './data'

export function fmt(n: number): string {
  if (n === 0) return '\u2014'
  if (n >= 1000000) return `${(n / 1000000).toFixed(2).replace('.', ',')} M\u20AC`
  return `${n.toLocaleString('fr-FR')} \u20AC`
}

export interface Statut {
  label: string
  color: string
  icon: string
}

export function getStatut(etat: string): Statut {
  const e = etat.toLowerCase()
  if (e.includes('en cours') || e.includes('validé par mail'))
    return { label: 'En cours', color: 'text-green bg-green/10 border-green/30', icon: '\u25CF' }
  if (e.includes('attente signature'))
    return { label: 'Attente signature', color: 'text-blue bg-blue/10 border-blue/30', icon: '\u25CE' }
  if (e.includes('attente contrat'))
    return { label: 'Attente contrat', color: 'text-blue bg-blue/10 border-blue/30', icon: '\u25CE' }
  if (e.includes('attente paiement'))
    return { label: 'Attente paiement', color: 'text-orange bg-orange/10 border-orange/30', icon: '\u25D1' }
  if (e.includes('attente gpa'))
    return { label: 'Attente réception', color: 'text-orange bg-orange/10 border-orange/30', icon: '\u25D1' }
  if (e.includes('attente os'))
    return { label: 'Attente OS', color: 'text-orange bg-orange/10 border-orange/30', icon: '\u25D1' }
  if (e.includes('vérif') || e.includes('verif'))
    return { label: 'À vérifier', color: 'text-orange bg-orange/10 border-orange/30', icon: '\u25D1' }
  if (e.includes('mise à jour') || e.includes('mise a jour'))
    return { label: 'À mettre à jour', color: 'text-orange bg-orange/10 border-orange/30', icon: '\u25D1' }
  if (e.includes('gelé') || e.includes('gele'))
    return { label: 'Gelé', color: 'text-red bg-red/10 border-red/30', icon: '\u26A0' }
  if (e.includes('stoppé') || e.includes('stoppe'))
    return { label: 'Arrêté', color: 'text-red bg-red/10 border-red/30', icon: '\u26A0' }
  if (e.includes('reste le det'))
    return { label: 'Phases restantes', color: 'text-blue bg-blue/10 border-blue/30', icon: '\u25CC' }
  if (e.includes('attente fin aor'))
    return { label: 'Clôture en cours', color: 'text-blue bg-blue/10 border-blue/30', icon: '\u25CC' }
  return { label: 'Inconnu', color: 'text-text-muted bg-text-muted/10 border-text-muted/30', icon: '\u00B7' }
}

export type NiveauAlerte = 'danger' | 'warning' | 'info'

export interface Alerte {
  niveau: NiveauAlerte
  projet: string
  montant: number
  message: string
  action: string
}

export function getAlertes(_projets: Projet[] = PROJETS): Alerte[] {
  return [
    {
      niveau: 'danger',
      projet: "Musée de l'Armée",
      montant: 30508,
      message: 'Gelé. Dernière facture ?? — 30 508\u20AC bloqués, aucune planification 2026',
      action: "Appeler le maître d'ouvrage cette semaine",
    },
    {
      niveau: 'danger',
      projet: 'SGP Gare de Blanc-Mesnil',
      montant: 7600,
      message: 'Possiblement stoppé en 2024 — 7 600\u20AC à risque de non-recouvrement',
      action: 'Confirmer statut avec MOA avant clôture',
    },
    {
      niveau: 'warning',
      projet: 'Manitou Suite',
      montant: 30625,
      message: 'Attente paiement — 30 625\u20AC sans planification 2026',
      action: 'Relance client à envoyer',
    },
    {
      niveau: 'warning',
      projet: 'Palais Bourbon Moatti - muséo',
      montant: 136000,
      message: 'Attente OS avenant — 136 000\u20AC bloqués. Seulement 3 600\u20AC planifiés en 2026',
      action: 'Suivre déblocage OS avec MOE',
    },
    {
      niveau: 'warning',
      projet: 'Nausicaa',
      montant: 98766,
      message: "98 766\u20AC d'honoraires — seulement 7 901\u20AC planifiés en 2026 (8%)",
      action: 'Mettre à jour le planning de facturation',
    },
    {
      niveau: 'info',
      projet: 'Septembre 2026',
      montant: 0,
      message: 'Mois creux — aucune facturation planifiée en septembre',
      action: 'Anticiper avec les projets "Attente contrat"',
    },
    {
      niveau: 'info',
      projet: 'Insight : ACT2 + DET + AOR',
      montant: 19950,
      message: 'Attente signature contrat — 19 950\u20AC conditionnels',
      action: 'Relancer pour signature',
    },
  ]
}

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

export function getMoisLabel(index: number): string {
  return MOIS_LABELS[index]
}

export const MOIS_COURANT_INDEX = 2 // Mars
