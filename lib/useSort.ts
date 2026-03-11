'use client'
import { useState, useMemo } from 'react'

type SortDir = 'asc' | 'desc'

export function useSort<T>(data: T[], defaultKey: string, defaultDir: SortDir = 'desc') {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir)

  const requestSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a: any, b: any) => {
      const va = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : a[sortKey] ?? 0
      const vb = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : b[sortKey] ?? 0
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  return { sorted, sortKey, sortDir, requestSort }
}
