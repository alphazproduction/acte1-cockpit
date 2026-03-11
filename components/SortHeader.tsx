'use client'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function SortHeader({
  label, sortKey, currentKey, currentDir, onSort, className = ''
}: {
  label: string; sortKey: string; currentKey: string; currentDir: 'asc' | 'desc'; onSort: (key: string) => void; className?: string
}) {
  const active = currentKey === sortKey
  return (
    <th
      className={`cursor-pointer select-none hover:text-[var(--accent)] transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {active && (currentDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
      </span>
    </th>
  )
}
