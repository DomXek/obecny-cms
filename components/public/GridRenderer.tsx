import { PageRow, ColumnSlot, COLUMN_LAYOUTS } from '@/lib/types'
import TextWidget        from './widgets/TextWidget'
import ImageWidget       from './widgets/ImageWidget'
import ButtonWidget      from './widgets/ButtonWidget'
import DividerWidget     from './widgets/DividerWidget'
import CtaWidget         from './widgets/CtaWidget'
import CardsWidget       from './widgets/CardsWidget'
import NewsWidget        from './widgets/NewsWidget'
import ContactWidget     from './widgets/ContactWidget'
import PlaceholderWidget from './widgets/PlaceholderWidget'

const FULL_BLEED = new Set(['cta'])
const NO_CARD = new Set(['divider', 'button'])

function WidgetSwitch({ slot, tenantId, basePath }: { slot: ColumnSlot; tenantId?: string | null; basePath?: string }) {
  if (!slot.type) return null
  switch (slot.type) {
    case 'text':    return <TextWidget    content={slot.content} />
    case 'image':   return <ImageWidget   content={slot.content} />
    case 'button':  return <ButtonWidget  content={slot.content} />
    case 'divider': return <DividerWidget content={slot.content} />
    case 'cta':     return <CtaWidget     content={slot.content} />
    case 'cards':   return <CardsWidget   content={slot.content} />
    case 'news':    return <NewsWidget     tenantId={tenantId} basePath={basePath} />
    case 'contact': return <ContactWidget  tenantId={tenantId} />
    default:        return <PlaceholderWidget type={slot.type} />
  }
}

function RowRenderer({ row, tenantId, basePath }: { row: PageRow; tenantId?: string | null; basePath?: string }) {
  const widths = COLUMN_LAYOUTS[row.layout]?.cols ?? [100]
  const filledCols = row.columns.filter(c => c.type)
  if (filledCols.length === 0) return null

  return (
    <div className="flex gap-6 items-stretch" style={row.minHeight ? { minHeight: row.minHeight } : undefined}>
      {row.columns.map((col, i) => {
        if (!col.type) return null
        const fullBleed = FULL_BLEED.has(col.type)
        const noCard = NO_CARD.has(col.type)
        return (
          <div
            key={col.id}
            className={`overflow-hidden ${fullBleed || noCard ? '' : 'bg-white border border-black/6 p-4'}`}
            style={{
              flex:         widths[i] ?? 100,
              borderRadius: fullBleed || noCard ? 0 : 'var(--radius)',
              boxShadow:    fullBleed || noCard ? 'none' : 'var(--shadow)',
            }}
          >
            <WidgetSwitch slot={col} tenantId={tenantId} basePath={basePath} />
          </div>
        )
      })}
    </div>
  )
}

export default function GridRenderer({ rows, tenantId, basePath }: { rows: PageRow[]; tenantId?: string | null; basePath?: string }) {
  if (!rows?.length) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {rows.map(row => (
        <RowRenderer key={row.id} row={row} tenantId={tenantId} basePath={basePath} />
      ))}
    </section>
  )
}
