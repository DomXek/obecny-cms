interface CardItem { icon: string; title: string; desc: string }
interface Props { content: Record<string, unknown> }

export default function CardsWidget({ content }: Props) {
  const items   = (content.items as CardItem[]) ?? []
  const columns = (content.columns as number)   ?? 3

  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns] ?? gridCols[3]} gap-4 h-full content-start p-2`}>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col p-5 border border-black/6 transition-shadow hover:shadow-md"
          style={{
            background: '#fff',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="text-3xl mb-3">{item.icon}</div>
          <h3
            className="text-sm font-bold mb-1.5"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-text)' }}
          >
            {item.title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text)', opacity: 0.6 }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  )
}
