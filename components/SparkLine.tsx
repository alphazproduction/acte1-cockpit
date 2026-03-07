import { MOIS_COURANT_INDEX } from '@/lib/utils'

export default function SparkLine({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px] h-6">
      {data.map((v, i) => (
        <div
          key={i}
          className={`w-[5px] rounded-[1px] ${
            v > 0
              ? i === MOIS_COURANT_INDEX
                ? 'bg-[var(--accent)]'
                : i < MOIS_COURANT_INDEX
                ? 'bg-[var(--success)] opacity-50'
                : 'bg-[var(--accent)] opacity-40'
              : 'bg-[var(--border)]'
          }`}
          style={{ height: v > 0 ? `${Math.max((v / max) * 100, 12)}%` : '3px' }}
        />
      ))}
    </div>
  )
}
