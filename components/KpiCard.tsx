import SourceTag from './SourceTag'

interface KpiCardProps {
  label: string
  value: string
  source: string
  accent?: 'gold' | 'green' | 'blue' | 'red'
}

export default function KpiCard({ label, value, source, accent = 'gold' }: KpiCardProps) {
  const accentColors = {
    gold: 'text-gold',
    green: 'text-green',
    blue: 'text-blue',
    red: 'text-red',
  }

  return (
    <div className="rounded-lg border border-border-custom bg-bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${accentColors[accent]}`}>{value}</p>
      <SourceTag source={source} />
    </div>
  )
}
