interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-serif text-2xl text-[var(--text-primary)]">{title}</h2>
        <span className="font-mono text-xs text-[var(--text-secondary)]">{today}</span>
      </div>
      {subtitle && <p className="mt-1 font-sans text-sm text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  )
}
