// ── Configuration API Google Apps Script ──────────────────────────
// L'URL est celle du déploiement Web App de votre Google Apps Script
// À configurer dans Paramètres ou via variable d'environnement

const GAS_URL_KEY = 'gas-api-url'

export function getGasUrl(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GAS_URL_KEY)
}

export function setGasUrl(url: string) {
  localStorage.setItem(GAS_URL_KEY, url)
}

export function isApiConfigured(): boolean {
  return !!getGasUrl()
}

// ── Appels API ──────────────────────────────────────────────────

export async function fetchFromSheet(action: string, params?: Record<string, string>) {
  const url = getGasUrl()
  if (!url) throw new Error('API non configurée')

  const searchParams = new URLSearchParams({ action, ...params })
  const response = await fetch(`${url}?${searchParams}`)
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`)
  return response.json()
}

export async function updateSheet(action: string, data: Record<string, unknown>) {
  const url = getGasUrl()
  if (!url) throw new Error('API non configurée')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS ne supporte pas application/json en CORS
    body: JSON.stringify({ action, data }),
  })
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`)
  return response.json()
}

export async function updatePrevisionnel(projetId: string, annee: number, moisIndex: number, montant: number) {
  return updateSheet('update_previsionnel', { projet_id: projetId, annee, mois_index: moisIndex, montant })
}

export async function updateProjet(projetId: string, champ: string, valeur: string | number) {
  return updateSheet('update_projet', { projet_id: projetId, champ, valeur })
}
