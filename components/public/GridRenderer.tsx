import { PageRow, ColumnSlot, COLUMN_LAYOUTS } from '@/lib/types'
import TextWidget   from './widgets/TextWidget'
import CtaWidget    from './widgets/CtaWidget'
import CardsWidget  from './widgets/CardsWidget'
import NewsWidget   from './widgets/NewsWidget'
import PlaceholderWidget from './widgets/PlaceholderWidget'

// Blocks that manage their own background — no padding, no card wrapper
const FULL_BLEED = new Set(['cta'])

function WidgetSwitch({ slot }: { slot: ColumnSlot }) {
  if (!slot.type) return null
  switch (slot.type) {
    case 'text':  return <TextWidget   content={slot.content} />
    case 'cta':   return <CtaWidget    content={slot.content} />
    case 'cards': return <CardsWidget  content={slot.content} />
    case 'news':  return <NewsWidget />
    default:      return <PlaceholderWidget type={slot.type} />
  }
}

function RowRenderer({ row }: { row: PageRow }) {
  const widths = COLUMN_LAYOUTS[row.layout]?.cols ?? [100]
  const filledCols = row.columns.filter(c => c.type)
  if (filledCols.length === 0) return null

  return (
    <div className="flex gap-6 items-stretch" style={row.minHeight ? { minHeight: row.minHeight } : undefined}>
      {row.columns.map((col, i) => {
        if (!col.type) return null
        const fullBleed = FULL_BLEED.has(col.type)
        return (
          <div
            key={col.id}
            className={`overflow-hidden ${fullBleed ? '' : 'bg-white border border-black/6 p-4'}`}
            style={{
              flex:         widths[i] ?? 100,
              borderRadius: fullBleed ? 0 : 'var(--radius)',
              boxShadow:    fullBleed ? 'none' : 'var(--shadow)',
            }}
          >
            <WidgetSwitch slot={col} />
          </div>
        )
      })}
    </div>
  )
}

export default function GridRenderer({ rows }: { rows: PageRow[] }) {
  if (!rows?.length) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {rows.map(row => (
        <RowRenderer key={row.id} row={row} />
      ))}
    </section>
  )
}
