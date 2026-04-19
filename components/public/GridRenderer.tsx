import { Block } from '@/lib/types'
import { COLS, ROW_H, GAP } from '@/lib/gridUtils'
import TextWidget from './widgets/TextWidget'
import CtaWidget from './widgets/CtaWidget'
import CardsWidget from './widgets/CardsWidget'
import NewsWidget from './widgets/NewsWidget'
import PlaceholderWidget from './widgets/PlaceholderWidget'

// Blocks that manage their own background — no padding, no card wrapper
const FULL_BLEED = new Set(['cta'])

function WidgetSwitch({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':  return <TextWidget content={block.content} />
    case 'cta':   return <CtaWidget content={block.content} />
    case 'cards':      return <CardsWidget content={block.content} />
    case 'news':       return <NewsWidget />
    default:           return <PlaceholderWidget type={block.type} />
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
        {blocks.map(block => {
          const fullBleed = FULL_BLEED.has(block.type)
          return (
            <div
              key={block.id}
              className={`overflow-hidden ${fullBleed ? '' : 'bg-white border border-black/6 p-4'}`}
              style={{
                gridColumn: `${block.col + 1} / ${block.col + block.colSpan + 1}`,
                gridRow:    `${block.row + 1} / ${block.row + block.rowSpan + 1}`,
                borderRadius: 'var(--radius)',
                boxShadow: fullBleed ? 'none' : 'var(--shadow)',
              }}
            >
              <WidgetSwitch block={block} />
            </div>
          )
        })}
      </div>

      {/* Mobile: sorted stack */}
      <div className="flex flex-col gap-4 md:hidden">
        {[...blocks]
          .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col)
          .map(block => {
            const fullBleed = FULL_BLEED.has(block.type)
            return (
              <div
                key={block.id}
                className={`overflow-hidden ${fullBleed ? '' : 'bg-white border border-black/6 p-4'}`}
                style={{
                  minHeight: `${block.rowSpan * ROW_H}px`,
                  borderRadius: 'var(--radius)',
                  boxShadow: fullBleed ? 'none' : 'var(--shadow)',
                }}
              >
                <WidgetSwitch block={block} />
              </div>
            )
          })
        }
      </div>
    </section>
  )
}
