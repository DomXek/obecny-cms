interface Props {
  content: Record<string, unknown>
}

export default function DividerWidget({ content }: Props) {
  const style = (content.style as string) || 'line'
  const spacing = (content.spacing as string) || 'md'

  const spacingClass = spacing === 'sm' ? 'my-2' : spacing === 'lg' ? 'my-8' : 'my-4'

  if (style === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${spacingClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      </div>
    )
  }

  return <hr className={`border-t border-gray-200 ${spacingClass}`} />
}
