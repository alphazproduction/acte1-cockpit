export default function SourceTag({ source }: { source: string }) {
  return (
    <p className="mt-2 font-mono text-[11px] text-text-muted/60 tracking-wide">
      ↗ Source : {source}
    </p>
  )
}
