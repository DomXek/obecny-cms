'use client'

import { useRef, useState } from 'react'
import { GripVertical, X, Edit2 } from 'lucide-react'
import { Block, WIDGET_DEFS } from '@/lib/types'

export const COLS = 12
export const ROW_H = 90   // px per row unit
export const GAP = 10     // px gap between cells

interface Props {
  block: Block
  canvasEl: HTMLDivElement | null
  onUpdate: (b: Block) => void
  onDelete: () => void
  onEdit: () => void
}

export default function GridBlock({ block, canvasEl, onUpdate, onDelete, onEdit }: Props) {
  const def = WIDGET_DEFS[block.type]
  const [active, setActive] = useState<'move' | 'resizeR' | 'resizeB' | null>(null)

  // ── helpers ────────────────────────────────────────────────────────────────
  function colWidth(totalW: number) {
    return (totalW - (COLS - 1) * GAP) / COLS
  }

  function snapCol(px: number, totalW: number) {
    const cw = colWidth(totalW)
    return Math.max(0, Math.min(COLS - 1, Math.round(px / (cw + GAP))))
  }

  function snapColSpan(px: number, totalW: number) {
    const cw = colWidth(totalW)
    return Math.max(1, Math.min(COLS - block.col, Math.round(px / (cw + GAP))))
  }

  function snapRowSpan(px: number) {
    return Math.max(1, Math.round(px / (ROW_H + GAP)))
  }

  // ── move ───────────────────────────────────────────────────────────────────
  function startMove(e: React.MouseEvent) {
    if (!canvasEl) return
    e.preventDefault()
    e.stopPropagation()
    const rect = canvasEl.getBoundingClientRect()
    const cw = colWidth(rect.width)
    const startX = e.clientX
    const startY = e.clientY
    const startCol = block.col
    const startRow = block.row

    setActive('move')

    function onMove(e: MouseEvent) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const newCol = Math.max(0, Math.min(COLS - block.colSpan, Math.round(startCol + dx / (cw + GAP))))
      const newRow = Math.max(0, Math.round(startRow + dy / (ROW_H + GAP)))
      if (newCol !== block.col || newRow !== block.row) {
        onUpdate({ ...block, col: newCol, row: newRow })
      }
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── resize right ──────────────────────────────────────────────────────────
  function startResizeRight(e: React.MouseEvent) {
    if (!canvasEl) return
    e.preventDefault()
    e.stopPropagation()
    const rect = canvasEl.getBoundingClientRect()
    const cw = colWidth(rect.width)
    const startX = e.clientX
    const startSpan = block.colSpan

    setActive('resizeR')

    function onMove(e: MouseEvent) {
      const dx = e.clientX - startX
      const newSpan = Math.max(1, Math.min(COLS - block.col, Math.round(startSpan + dx / (cw + GAP))))
      if (newSpan !== block.colSpan) onUpdate({ ...block, colSpan: newSpan })
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── resize bottom ─────────────────────────────────────────────────────────
  function startResizeBottom(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const startSpan = block.rowSpan

    setActive('resizeB')

    function onMove(e: MouseEvent) {
      const dy = e.clientY - startY
      const newSpan = Math.max(1, Math.round(startSpan + dy / (ROW_H + GAP)))
      if (newSpan !== block.rowSpan) onUpdate({ ...block, rowSpan: newSpan })
    }

    function onUp() {
      setActive(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── render ─────────────────────────────────────────────────────────────────
  const isText = block.type === 'text'
  const hasHtml = isText && (block.content.html as string | undefined)

  return (
    <div
      className={`group/block relative select-none ${active ? 'z-50' : 'z-10 hover:z-20'}`}
      style={{
        gridColumn: `${block.col + 1} / ${block.col + block.colSpan + 1}`,
        gridRow:    `${block.row + 1} / ${block.row + block.rowSpan + 1}`,
      }}
    >
      {/* ── Main block body ─────────────────────────────────────────────── */}
      <div
        className={`w-full h-full rounded-xl overflow-hidden border-2 transition-colors ${
          active
            ? 'border-blue-500 shadow-lg shadow-blue-200'
            : 'border-gray-200 group-hover/block:border-blue-300'
        } ${hasHtml ? 'bg-white' : 'bg-white'}`}
      >
        {/* Inner content */}
        {hasHtml ? (
          <div
            className="p-5 prose prose-sm max-w-none text-gray-800 h-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: block.content.html as string }}
          />
        ) : (
          <div className={`flex flex-col items-center justify-center h-full gap-2 text-gray-400`}>
            <span className="text-3xl">{def.icon}</span>
            <span className="text-sm font-medium">{def.label}</span>
            <span className="text-xs opacity-60">{block.colSpan} × {block.rowSpan}</span>
          </div>
        )}
      </div>

      {/* ── Top toolbar (hover) ──────────────────────────────────────────── */}
      <div
        className={`absolute -top-9 left-0 flex items-center gap-0.5 bg-blue-600 rounded-t-lg px-1.5 py-1 transition-opacity pointer-events-none group-hover/block:pointer-events-auto ${
          active ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        {/* Drag handle — move the block */}
        <button
          onMouseDown={startMove}
          className="cursor-grab active:cursor-grabbing p-1 text-blue-200 hover:text-white transition-colors"
          title="Presunúť"
        >
          <GripVertical size={13} />
        </button>
        <span className="text-xs text-blue-200 px-1 font-medium">{def.label}</span>
        <div className="w-px h-3 bg-blue-500 mx-0.5" />
        <button
          onMouseDown={e => { e.stopPropagation(); onEdit() }}
          className="p-1 text-blue-200 hover:text-white transition-colors"
          title="Upraviť"
        >
          <Edit2 size={12} />
        </button>
        <button
          onMouseDown={e => { e.stopPropagation(); onDelete() }}
          className="p-1 text-blue-200 hover:text-red-300 transition-colors"
          title="Zmazať"
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Right resize handle ──────────────────────────────────────────── */}
      <div
        onMouseDown={startResizeRight}
        className={`absolute top-2 bottom-2 -right-2 w-4 flex items-center justify-center cursor-ew-resize z-30 transition-opacity ${
          active === 'resizeR' ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="w-1.5 h-10 bg-blue-400 rounded-full shadow" />
      </div>

      {/* ── Bottom resize handle ─────────────────────────────────────────── */}
      <div
        onMouseDown={startResizeBottom}
        className={`absolute left-2 right-2 -bottom-2 h-4 flex items-center justify-center cursor-ns-resize z-30 transition-opacity ${
          active === 'resizeB' ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="h-1.5 w-10 bg-blue-400 rounded-full shadow" />
      </div>

      {/* ── Corner resize (both axes at once) ───────────────────────────── */}
      <div
        onMouseDown={e => { startResizeRight(e); }}
        className={`absolute -bottom-2 -right-2 w-5 h-5 flex items-center justify-center cursor-nwse-resize z-40 transition-opacity ${
          active ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
      >
        <div className="w-3 h-3 bg-blue-500 rounded-sm shadow-md" />
      </div>
    </div>
  )
}
