interface Props { content: Record<string, unknown> }

export default function TextWidget({ content }: Props) {
  const html          = (content.html          as string) ?? ''
  const imageUrl      = (content.imageUrl      as string) ?? ''
  const imagePosition = (content.imagePosition as string) ?? 'right'

  const textBlock = (
    <div
      className="prose prose-gray max-w-none text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )

  const imgBlock = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="object-cover w-full"
      style={{ borderRadius: 'var(--radius-sm)' }}
    />
  ) : null

  // No image — just text
  if (!imgBlock) {
    return <div className="h-full overflow-auto px-1">{textBlock}</div>
  }

  // Top / Bottom
  if (imagePosition === 'top' || imagePosition === 'bottom') {
    return (
      <div className="flex flex-col gap-4 h-full overflow-auto">
        {imagePosition === 'top' && imgBlock}
        {textBlock}
        {imagePosition === 'bottom' && imgBlock}
      </div>
    )
  }

  // Left / Right (default)
  const imgFirst = imagePosition === 'left'
  return (
    <div className="flex gap-5 h-full items-start overflow-auto">
      {imgFirst && (
        <div className="w-2/5 shrink-0">{imgBlock}</div>
      )}
      <div className="flex-1 min-w-0">{textBlock}</div>
      {!imgFirst && (
        <div className="w-2/5 shrink-0">{imgBlock}</div>
      )}
    </div>
  )
}
