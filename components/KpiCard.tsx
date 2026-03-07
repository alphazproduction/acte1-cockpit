import SourceTag from './SourceTag'

interface KpiCardProps {
  label: string
  value: string
  source: string
  sourceDetail?: string
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const ACCENTS = {
  default: 'text-[var(--accent)]',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
  danger: 'text-[var(--danger)]',
  info: 'text-[var(--info)]',
}

export default function KpiCard({ label, value, source, sourceDetail, accent = 'default' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${ACCENTS[accent]}`}>{value}</p>
      <SourceTag source={source} detail={sourceDetail} />
    </div>
  )
}
