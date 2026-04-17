interface Props { content: Record<string, unknown> }

export default function TextWidget({ content }: Props) {
  const html = (content.html as string) ?? ''
  return (
    <div
      className="prose prose-gray max-w-none text-sm px-1 h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
