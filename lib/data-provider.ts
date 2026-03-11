// ── Data Provider : POC (statique) ou Live (Google Sheets) ────────
// Le mode est stocké dans localStorage. Par défaut = 'poc'.
// En mode 'live', les données sont fetchées via l'API GAS.

import { type Projet, PROJETS as PROJETS_POC, TOTAUX_MOIS_2026 as TOTAUX_POC } from './data'
import { fetchFromSheet, isApiConfigured } from './api'

const MODE_KEY = 'data-mode'

export type DataMode = 'poc' | 'live'

export function getDataMode(): DataMode {
  if (typeof window === 'undefined') return 'poc'
  return (localStorage.getItem(MODE_KEY) as DataMode) || 'poc'
}

export function setDataMode(mode: DataMode) {
  localStorage.setItem(MODE_KEY, mode)
}

export function canGoLive(): boolean {
  return isApiConfigured()
}

// ── Cache en mémoire pour les données live ──

let liveCache: {
  projets: Projet[]
  totaux: { mois: string; montant: number }[]
  timestamp: number
} | null = null

const CACHE_TTL = 60_000 // 1 minute

// ── Fetcher les données depuis le GAS ──

interface GasPrevProjet {
  id: string
  nom: string
  mois: number[]
  total: number
}

interface GasProjet {
  projet_id: string
  nom_projet: string
  client?: string
  etat?: string
  responsable?: string
  honoraires_ht?: number
  facture_n1?: number
  date_debut?: string
  date_fin_prevue?: string
  date_fin_revisee?: string
  trigramme?: string
}

function mapGasToProjet(gasProjets: GasProjet[], gasPrev: GasPrevProjet[]): Projet[] {
  const prevMap = new Map<string, GasPrevProjet>()
  for (const p of gasPrev) {
    prevMap.set(p.id, p)
  }

  return gasProjets.map((gp) => {
    const prev = prevMap.get(gp.projet_id)
    const mois = prev?.mois ?? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const honoraire = Number(gp.honoraires_ht) || 0
    const factureN1 = Number(gp.facture_n1) || 0

    return {
      id: gp.projet_id || '',
      code: gp.trigramme || gp.projet_id?.slice(0, 3)?.toUpperCase() || '???',
      projet: gp.nom_projet || '',
      etat: gp.etat || 'En cours',
      honoraire,
      facture_n1: factureN1,
      reste: honoraire - factureN1,
      mois,
      total_2026: prev?.total ?? mois.reduce((a, b) => a + b, 0),
      // Les données 2027 seront ajoutées quand le GAS les fournira
      debut: gp.date_debut || undefined,
      fin_initiale: gp.date_fin_prevue || undefined,
      fin_revisee: gp.date_fin_revisee || undefined,
    }
  })
}

export async function fetchLiveData(annee = 2026): Promise<{
  projets: Projet[]
  totaux: { mois: string; montant: number }[]
}> {
  // Vérifier le cache
  if (liveCache && Date.now() - liveCache.timestamp < CACHE_TTL) {
    return { projets: liveCache.projets, totaux: liveCache.totaux }
  }

  const data = await fetchFromSheet('all', { annee: String(annee) })

  const gasProjets: GasProjet[] = data.projets || []
  const gasPrev = data.previsionnel || {}
  const prevProjets: GasPrevProjet[] = gasPrev.projets || []
  const totauxMois: { mois: string; montant: number }[] = gasPrev.totaux_mois || []

  const projets = mapGasToProjet(gasProjets, prevProjets)

  liveCache = { projets, totaux: totauxMois, timestamp: Date.now() }
  return { projets, totaux: totauxMois }
}

// ── Données POC (fallback toujours dispo) ──

export function getPocData() {
  return {
    projets: PROJETS_POC,
    totaux: TOTAUX_POC.map((t) => ({ mois: t.mois, montant: t.montant })),
  }
}

// ── Invalidation du cache (après écriture) ──

export function invalidateCache() {
  liveCache = null
}
