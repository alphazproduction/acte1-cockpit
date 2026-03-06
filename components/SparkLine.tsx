interface SparkLineProps {
  data: number[]
}

export default function SparkLine({ data }: SparkLineProps) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-[2px] h-6">
      {data.map((v, i) => (
        <div
          key={i}
          className={`w-[5px] rounded-[1px] ${
            v > 0 ? (i === 2 ? 'bg-blue' : 'bg-gold/60') : 'bg-border-custom'
          }`}
          style={{ height: v > 0 ? `${Math.max((v / max) * 100, 12)}%` : '3px' }}
        />
      ))}
    </div>
  )
}
