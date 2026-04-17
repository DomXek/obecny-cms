import { Block } from '@/lib/types'
import { COLS, ROW_H, GAP } from '@/lib/gridUtils'
import TextWidget from './widgets/TextWidget'
import NewsWidget from './widgets/NewsWidget'
import PlaceholderWidget from './widgets/PlaceholderWidget'

function WidgetSwitch({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':    return <TextWidget content={block.content} />
    case 'news':    return <NewsWidget />
    default:        return <PlaceholderWidget type={block.type} />
  }
}

export default function GridRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null

  const rows = Math.max(...blocks.map(b => b.row + b.rowSpan))

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      {/* Desktop grid */}
      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows:    `repeat(${rows}, minmax(${ROW_H}px, auto))`,
          gap: `${GAP}px`,
        }}
      >
        {blocks.map(block => (
          <div
            key={block.id}
            className="bg-white border border-gray-100 p-4 overflow-hidden"
            style={{
              gridColumn: `${block.col + 1} / ${block.col + block.colSpan + 1}`,
              gridRow:    `${block.row + 1} / ${block.row + block.rowSpan + 1}`,
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <WidgetSwitch block={block} />
          </div>
        ))}
      </div>

      {/* Mobile: sorted stack */}
      <div className="flex flex-col gap-4 md:hidden">
        {[...blocks]
          .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col)
          .map(block => (
            <div
              key={block.id}
              className="bg-white border border-gray-100 p-4"
              style={{ minHeight: `${block.rowSpan * ROW_H}px`, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
            >
              <WidgetSwitch block={block} />
            </div>
          ))
        }
      </div>
    </section>
  )
}
