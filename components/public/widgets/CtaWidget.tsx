interface Props { content: Record<string, unknown> }

export default function CtaWidget({ content }: Props) {
  const heading     = (content.heading as string)     ?? 'Kontaktujte nás'
  const subtext     = (content.subtext as string)     ?? ''
  const buttonLabel = (content.buttonLabel as string) ?? 'Zistiť viac'
  const buttonUrl   = (content.buttonUrl as string)   ?? '#'
  const align       = (content.align as string)       ?? 'center'

  const textAlign = align === 'center' ? 'text-center' : 'text-left'
  const flex      = align === 'center' ? 'items-center' : 'items-start'

  return (
    <div
      className={`w-full h-full flex flex-col justify-center ${flex} ${textAlign} px-8 py-8`}
      style={{ background: 'var(--c-primary)' }}
    >
      <h2
        className="text-2xl md:text-3xl font-bold text-white mb-2 leading-snug"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {heading}
      </h2>
      {subtext && (
        <p className="text-white/75 text-sm mb-5 max-w-lg">{subtext}</p>
      )}
      {buttonLabel && buttonUrl && (
        <a
          href={buttonUrl}
          className="inline-block text-sm font-bold px-6 py-2.5 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: '#fff', color: 'var(--c-primary)', borderRadius: 'var(--radius-sm)' }}
        >
          {buttonLabel}
        </a>
      )}
    </div>
  )
}
