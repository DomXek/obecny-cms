interface Props { content: Record<string, unknown> }

export default function ImageTextWidget({ content }: Props) {
  const imageUrl      = content.imageUrl as string | undefined
  const imagePosition = (content.imagePosition as string) ?? 'right'
  const heading       = content.heading as string | undefined
  const text          = content.text as string | undefined
  const buttonLabel   = content.buttonLabel as string | undefined
  const buttonUrl     = content.buttonUrl as string | undefined

  const imgCol = imagePosition === 'left' ? 'order-first' : 'order-last'

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 h-full p-2">
      {/* Text side */}
      <div className="flex-1 min-w-0">
        {heading && (
          <h2 className="text-2xl font-bold mb-3 leading-snug"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}>
            {heading}
          </h2>
        )}
        {text && (
          <div
            className="prose prose-gray max-w-none text-sm mb-4"
            style={{ color: 'var(--c-text)' }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
        {buttonLabel && buttonUrl && (
          <a
            href={buttonUrl}
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-85"
            style={{ background: 'var(--c-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            {buttonLabel}
          </a>
        )}
      </div>

      {/* Image side */}
      <div className={`w-full md:w-2/5 shrink-0 ${imgCol}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={heading ?? ''}
            className="w-full h-56 object-cover"
            style={{ borderRadius: 'var(--radius)' }}
          />
        ) : (
          <div
            className="w-full h-56 flex items-center justify-center text-4xl"
            style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--radius)' }}
          >
            🖼
          </div>
        )}
      </div>
    </div>
  )
}
