'use client'

import { useState } from 'react'
import { GripVertical, X, Edit2 } from 'lucide-react'
import { Block, WIDGET_DEFS } from '@/lib/types'
import { COLS, ROW_H, GAP, colWidth, xToCol, yToRow, dxToColDelta, dyToRowDelta } from '@/lib/gridUtils'

interface Props {
  block: Block
  canvasEl: HTMLDivElement | null
  onUpdate: (b: Block) => void
  onDelete: () => void
  onEdit: () => void
}

export default function GridBlock({ block, canvasEl, onUpdate, onDelete, onEdit }: Props) {
  const def = WIDGET_DEFS[block.type as keyof typeof WIDGET_DEFS] ?? { label: block.type, icon: '📦', description: '' }
  const [active, setActive] = useState<'move' | 'resizeR' | 'resizeB' | null>(null)

  // ── Move ─────────────────────────────────────────────────────────────────
  function startMove(e: React.MouseEvent) {
    if (!canvasEl) return
    e.preventDefault()
    e.stopPropagation()
    setActive('move')

    // Capture how far inside the block the user clicked (col/row offset)
    // so the block doesn't snap its top-left corner to the cursor
    const clickCol = xToCol(e.clientX, canvasEl)
    const clickRow = yToRow(e.clientY, canvasEl)
    const colOffset = Math.max(0, clickCol - block.col)
    const rowOffset = Math.max(0, clickRow - block.row)

    function onMove(ev: MouseEvent) {
      // Use absolute canvas-relative position — immune to scroll drift
      const targetCol = xToCol(ev.clientX, canvasEl!)
      const targetRow = yToRow(ev.clientY, canvasEl!)
      const newCol = Math.max(0, Math.min(COLS - block.colSpan, targetCol - colOffset))
      const newRow = Math.max(0, targetRow - rowOffset)
      onUpdate({ ...block, col: newCol, row: newRow })
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Resize right (colSpan) ───────────────────────────────────────────────
  function startResizeRight(e: React.MouseEvent) {
    if (!canvasEl) return
    e.preventDefault()
    e.stopPropagation()

    setActive('resizeR')

    function onMove(ev: MouseEvent) {
      // Absolute: end col = wherever cursor is now
      const endCol = xToCol(ev.clientX, canvasEl!)
      const newSpan = Math.max(1, Math.min(COLS - block.col, endCol - block.col + 1))
      onUpdate({ ...block, colSpan: newSpan })
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Resize bottom (rowSpan) ──────────────────────────────────────────────
  function startResizeBottom(e: React.MouseEvent) {
    if (!canvasEl) return
    e.preventDefault()
    e.stopPropagation()

    setActive('resizeB')

    function onMove(ev: MouseEvent) {
      // Absolute: bottom row = wherever cursor is now
      const endRow = yToRow(ev.clientY, canvasEl!)
      const newSpan = Math.max(1, endRow - block.row + 1)
      onUpdate({ ...block, rowSpan: newSpan })
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const hasHtml = block.type === 'text' && (block.content.html as string | undefined)

  function BlockPreview() {
    if (hasHtml) {
      const hasImg = !!(block.content.imageUrl as string)
      const imgPos = (block.content.imagePosition as string) ?? 'right'
      return (
        <div className="flex gap-2 h-full overflow-hidden">
          {hasImg && imgPos === 'left' && (
            <div className="w-1/3 shrink-0 bg-gray-100 rounded-lg" />
          )}
          <div
            className="flex-1 p-4 prose prose-sm max-w-none text-gray-800 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: block.content.html as string }}
          />
          {hasImg && imgPos === 'right' && (
            <div className="w-1/3 shrink-0 bg-gray-100 rounded-lg" />
          )}
        </div>
      )
    }
    if (block.type === 'cta') {
      const heading = (block.content.heading as string) ?? 'CTA'
      return (
        <div className="h-full flex flex-col items-center justify-center gap-1.5 bg-blue-600 rounded-xl p-3">
          <div className="text-xs font-bold text-white truncate max-w-full">{heading}</div>
          <div className="px-3 py-1 bg-white rounded text-[10px] font-semibold text-blue-700">
            {(block.content.buttonLabel as string) ?? 'Tlačidlo'}
          </div>
        </div>
      )
    }
    if (block.type === 'cards') {
      const cols  = (block.content.columns as number) ?? 3
      const items = (block.content.items as { icon: string; title: string }[]) ?? []
      return (
        <div className="h-full p-3">
          <div className="text-[10px] text-gray-400 mb-2">{items.length} kariet · {cols} stĺpce</div>
          <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)` }}>
            {items.slice(0, 3).map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
                <div className="text-base">{item.icon}</div>
                <div className="text-[9px] text-gray-600 font-medium truncate">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
        <span className="text-3xl">{def.icon}</span>
        <span className="text-sm font-semibold">{def.label}</span>
        <span className="text-xs opacity-50">{block.colSpan} st. × {block.rowSpan} r.</span>
      </div>
    )
  }

  return (
    <div
      className={`group/block relative select-none ${active ? 'z-50' : 'z-10 hover:z-20'}`}
      style={{
        gridColumn: `${block.col + 1} / ${block.col + block.colSpan + 1}`,
        gridRow:    `${block.row + 1} / ${block.row + block.rowSpan + 1}`,
      }}
    >
      {/* Block body */}
      <div
        className={`w-full h-full rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
          active
            ? 'border-blue-500 shadow-lg'
            : 'border-gray-200 group-hover/block:border-blue-300'
        } bg-white`}
        onClick={() => { if (!active) onEdit() }}
      >
        <BlockPreview />
      </div>

      {/* Top toolbar — appears on hover */}
      <div
        className={`absolute -top-9 left-0 h-9 flex items-center gap-0.5 bg-blue-600 rounded-t-lg px-1.5 transition-opacity ${
          active ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        } pointer-events-none group-hover/block:pointer-events-auto`}
      >
        <button
          onMouseDown={startMove}
          className="cursor-grab active:cursor-grabbing p-1.5 text-blue-200 hover:text-white"
          title="Presunúť (drag)"
        >
          <GripVertical size={13} />
        </button>
        <span className="text-xs text-blue-100 font-medium px-1">{def.label}</span>
        <div className="w-px h-3 bg-blue-500 mx-0.5" />
        <button
          onMouseDown={e => { e.stopPropagation(); onEdit() }}
          className="p-1.5 text-blue-200 hover:text-white"
          title="Editovať"
        >
          <Edit2 size={12} />
        </button>
        <button
          onMouseDown={e => { e.stopPropagation(); onDelete() }}
          className="p-1.5 text-blue-200 hover:text-red-300"
          title="Zmazať"
        >
          <X size={13} />
        </button>
      </div>

      {/* Right resize handle */}
      <div
        onMouseDown={startResizeRight}
        className={`absolute top-3 bottom-3 -right-[9px] w-[8px] flex items-center justify-center cursor-ew-resize z-30 ${
          active === 'resizeR' ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="w-1.5 h-8 bg-blue-400 hover:bg-blue-500 rounded-full shadow" />
      </div>

      {/* Bottom resize handle */}
      <div
        onMouseDown={startResizeBottom}
        className={`absolute left-3 right-3 -bottom-[9px] h-[8px] flex items-center justify-center cursor-ns-resize z-30 ${
          active === 'resizeB' ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="h-1.5 w-8 bg-blue-400 hover:bg-blue-500 rounded-full shadow" />
      </div>

      {/* Corner resize dot */}
      <div
        onMouseDown={startResizeRight}
        className={`absolute -bottom-[9px] -right-[9px] w-5 h-5 flex items-center justify-center cursor-nwse-resize z-40 ${
          active ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="w-3 h-3 bg-blue-500 rounded shadow-md" />
      </div>
    </div>
  )
}
