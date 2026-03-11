// ── Configuration persistante (localStorage) ──────────────────────
// Permet de modifier l'objectif, les pondérations et l'URL du Sheet

const DEFAULTS = {
  objectif_annuel: 400000,
  nombre_associes: 2,
  prev_sous_traitance: 0,
  ponderations: [1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5],
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// ── Objectif annuel (par associé) ──

export function getObjectifAnnuel(): number {
  if (!isBrowser()) return DEFAULTS.objectif_annuel
  const saved = localStorage.getItem('objectif-annuel')
  return saved ? parseInt(saved, 10) : DEFAULTS.objectif_annuel
}

export function setObjectifAnnuel(v: number) {
  localStorage.setItem('objectif-annuel', String(v))
}

// ── Nombre d'associés ──

export function getNombreAssocies(): number {
  if (!isBrowser()) return DEFAULTS.nombre_associes
  const saved = localStorage.getItem('nombre-associes')
  return saved ? parseInt(saved, 10) : DEFAULTS.nombre_associes
}

export function setNombreAssocies(v: number) {
  localStorage.setItem('nombre-associes', String(Math.max(1, v)))
}

// ── Objectif global = par associé × nombre d'associés ──

export function getObjectifGlobal(): number {
  return getObjectifAnnuel() * getNombreAssocies()
}

// ── Prévisionnel sous-traitance ──

export function getPrevSousTraitance(): number {
  if (!isBrowser()) return DEFAULTS.prev_sous_traitance
  const saved = localStorage.getItem('prev-sous-traitance')
  return saved ? parseInt(saved, 10) : DEFAULTS.prev_sous_traitance
}

export function setPrevSousTraitance(v: number) {
  localStorage.setItem('prev-sous-traitance', String(v))
}

// ── Pondérations mensuelles ──

export function getPonderations(): number[] {
  if (!isBrowser()) return [...DEFAULTS.ponderations]
  const saved = localStorage.getItem('ponderations')
  if (saved) {
    try { return JSON.parse(saved) } catch { /* fallback */ }
  }
  return [...DEFAULTS.ponderations]
}

export function setPonderationsConfig(v: number[]) {
  localStorage.setItem('ponderations', JSON.stringify(v))
}

export function getSommePoids(ponderations?: number[]): number {
  const p = ponderations ?? getPonderations()
  return p.reduce((a, b) => a + b, 0)
}

// ── URL Google Sheets (lien direct) ──

export function getSheetUrl(): string {
  if (!isBrowser()) return ''
  return localStorage.getItem('sheet-url') || ''
}

export function setSheetUrl(url: string) {
  localStorage.setItem('sheet-url', url)
}
