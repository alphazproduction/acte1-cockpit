'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Projet } from './data'
import { type DataMode, getDataMode, setDataMode, fetchLiveData, getPocData, canGoLive, invalidateCache } from './data-provider'
import { updatePrevisionnel, updateProjet } from './api'

interface DataState {
  mode: DataMode
  projets: Projet[]
  totaux: { mois: string; montant: number }[]
  loading: boolean
  error: string | null
  toggleMode: () => void
  refresh: () => Promise<void>
  writePrevisionnel: (projetId: string, moisIndex: number, montant: number) => Promise<void>
  writeProjet: (projetId: string, champ: string, valeur: string | number) => Promise<void>
}

export function useData(): DataState {
  const [mode, setMode] = useState<DataMode>('poc')
  const [projets, setProjets] = useState<Projet[]>([])
  const [totaux, setTotaux] = useState<{ mois: string; montant: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (m: DataMode) => {
    setLoading(true)
    setError(null)

    if (m === 'live' && canGoLive()) {
      try {
        const data = await fetchLiveData()
        setProjets(data.projets)
        setTotaux(data.totaux)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de connexion au Google Sheet')
        // Fallback sur POC en cas d'erreur
        const poc = getPocData()
        setProjets(poc.projets)
        setTotaux(poc.totaux)
      }
    } else {
      const poc = getPocData()
      setProjets(poc.projets)
      setTotaux(poc.totaux)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const saved = getDataMode()
    setMode(saved)
    loadData(saved)
  }, [loadData])

  const toggleMode = useCallback(() => {
    const next: DataMode = mode === 'poc' ? 'live' : 'poc'
    if (next === 'live' && !canGoLive()) {
      setError('Configurez l\'URL API dans Paramètres d\'abord')
      return
    }
    setDataMode(next)
    setMode(next)
    invalidateCache()
    loadData(next)
  }, [mode, loadData])

  const refresh = useCallback(async () => {
    invalidateCache()
    await loadData(mode)
  }, [mode, loadData])

  const writePrevisionnel = useCallback(async (projetId: string, moisIndex: number, montant: number) => {
    if (mode !== 'live') return
    await updatePrevisionnel(projetId, 2026, moisIndex, montant)
    invalidateCache()
    await loadData(mode)
  }, [mode, loadData])

  const writeProjet = useCallback(async (projetId: string, champ: string, valeur: string | number) => {
    if (mode !== 'live') return
    await updateProjet(projetId, champ, valeur)
    invalidateCache()
    await loadData(mode)
  }, [mode, loadData])

  return { mode, projets, totaux, loading, error, toggleMode, refresh, writePrevisionnel, writeProjet }
}
