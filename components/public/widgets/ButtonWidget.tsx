interface Props {
  content: Record<string, unknown>
}

export default function ButtonWidget({ content }: Props) {
  const label = (content.label as string) || 'Kliknite tu'
  const url = (content.url as string) || '#'
  const align = (content.align as string) || 'center'
  const variant = (content.variant as string) || 'primary'

  const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'

  const btnClass = variant === 'secondary'
    ? 'border border-[var(--c-primary)] text-[var(--c-primary)] hover:bg-[var(--c-primary)] hover:text-white'
    : 'bg-[var(--c-primary)] text-white hover:opacity-90'

  return (
    <div className={`py-2 ${alignClass}`}>
      <a
        href={url}
        className={`inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all ${btnClass}`}
        style={{ borderRadius: 'var(--radius)' }}
      >
        {label}
      </a>
    </div>
  )
}
