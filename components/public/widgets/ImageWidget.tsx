interface Props {
  content: Record<string, unknown>
}

export default function ImageWidget({ content }: Props) {
  const url = (content.url as string) || ''
  const alt = (content.alt as string) || ''
  const caption = (content.caption as string) || ''

  if (!url) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-video text-gray-400 text-sm">
        Obrázok
      </div>
    )
  }

  return (
    <figure className="w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="w-full rounded-lg object-cover" />
      {caption && <figcaption className="text-xs text-gray-500 text-center mt-2">{caption}</figcaption>}
    </figure>
  )
}
