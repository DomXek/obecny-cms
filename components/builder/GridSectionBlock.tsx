'use client'

import { useState } from 'react'
import {
  ChevronUp, ChevronDown, Trash2, X, Plus,
  ArrowDown, ArrowUp, ArrowRight, ArrowLeft,
} from 'lucide-react'
import {
  GridSection, GridCell, WidgetType, WIDGETS,
  expandCell, shrinkCell, addRowToGrid, getTotalRows,
} from './types'
import TextWidgetEditor from './widgets/TextWidgetEditor'

// ─── Widget Picker ─────────────────────────────────────────────────────────────
function WidgetPicker({ onSelect, onClose }: { onSelect: (w: WidgetType) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-blue-400 p-3 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-gray-700">Vyber widget</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 flex-1 content-start">
        {(Object.entries(WIDGETS) as [WidgetType, typeof WIDGETS[WidgetType]][]).map(([key, w]) => (
          <button key={key} onClick={() => onSelect(key)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-opacity hover:opacity-80 ${w.bg} ${w.text}`}>
            <span className="text-base leading-none">{w.icon}</span>{w.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Cell ──────────────────────────────────────────────────────────────────────
function Cell({
  cell,
  section,
  onUpdate,
  onExpand,
  onShrink,
}: {
  cell: GridCell
  section: GridSection
  onUpdate: (updated: GridCell) => void
  onExpand: (dir: 'right' | 'down') => void
  onShrink: (dir: 'left' | 'up') => void
}) {
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(false)
  const w = WIDGETS[cell.widget]
  const canRight = cell.col + cell.colSpan < section.cols
  const canLeft  = cell.colSpan > 1
  const canUp    = cell.rowSpan > 1

  function handleClick() {
    if (editing || picking) return
    if (cell.widget === 'text') setEditing(true)
    else setPicking(true)
  }

  const hasTextContent = cell.widget === 'text' && cell.content?.html

  return (
    <div
      className="relative group min-h-[80px]"
      style={{
        gridColumn: `${cell.col + 1} / ${cell.col + cell.colSpan + 1}`,
        gridRow:    `${cell.row + 1} / ${cell.row + cell.rowSpan + 1}`,
      }}
    >
      {/* Main cell area */}
      <div
        onClick={handleClick}
        className={`w-full h-full rounded-lg cursor-pointer transition-colors overflow-hidden ${
          hasTextContent ? 'bg-white hover:bg-gray-50 border border-gray-200' : `${w.bg} hover:opacity-90`
        }`}
      >
        {hasTextContent ? (
          <div
            className="p-4 prose prose-sm max-w-none pointer-events-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: cell.content!.html! }}
          />
        ) : (
          <div className={`flex flex-col items-center justify-center h-full gap-1 select-none py-6 ${w.text}`}>
            <span className="text-2xl">{w.icon}</span>
            <span className="text-xs font-semibold">{w.label}</span>
            {(cell.colSpan > 1 || cell.rowSpan > 1) && (
              <span className="text-xs opacity-50">{cell.colSpan}×{cell.rowSpan}</span>
            )}
          </div>
        )}
      </div>

      {/* Expand/shrink handles — visible on hover */}
      <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto">

        {/* Expand right ▶ */}
        {canRight && (
          <button onMouseDown={e => { e.stopPropagation(); onExpand('right') }}
            title="Rozšíriť vpravo"
            className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={11} />
          </button>
        )}

        {/* Shrink left ◀ */}
        {canLeft && (
          <button onMouseDown={e => { e.stopPropagation(); onShrink('left') }}
            title="Zmenšiť zľava"
            className="absolute top-1/2 -translate-y-1/2 right-1 z-20 w-5 h-5 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowLeft size={9} />
          </button>
        )}

        {/* Expand down ▼ */}
        {(
          <button onMouseDown={e => { e.stopPropagation(); onExpand('down') }}
            title="Rozšíriť nadol"
            className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-20 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowDown size={11} />
          </button>
        )}

        {/* Shrink up ▲ */}
        {canUp && (
          <button onMouseDown={e => { e.stopPropagation(); onShrink('up') }}
            title="Zmenšiť zhora"
            className="absolute left-1/2 -translate-x-1/2 bottom-1 z-20 w-5 h-5 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUp size={9} />
          </button>
        )}

        {/* Change widget button */}
        {cell.widget !== 'empty' && !editing && !picking && (
          <button
            onMouseDown={e => { e.stopPropagation(); setPicking(true) }}
            className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 bg-white/90 border border-gray-200 rounded text-xs text-gray-500 hover:text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Zmeniť
          </button>
        )}
      </div>

      {/* Overlays */}
      {picking && (
        <div className="absolute inset-0 z-40">
          <WidgetPicker
            onSelect={w => { onUpdate({ ...cell, widget: w, content: w === 'text' ? (cell.content ?? {}) : {} }); setPicking(false); if (w === 'text') setEditing(true) }}
            onClose={() => setPicking(false)}
          />
        </div>
      )}
      {editing && (
        <div className="absolute inset-0 z-40">
          <TextWidgetEditor
            html={cell.content?.html ?? ''}
            onChange={html => onUpdate({ ...cell, content: { ...cell.content, html } })}
            onDone={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  )
}

// ─── GridSectionBlock ──────────────────────────────────────────────────────────
export default function GridSectionBlock({
  section,
  isFirst,
  isLast,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: GridSection
  isFirst: boolean
  isLast: boolean
  onChange: (s: GridSection) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  function updateCell(updated: GridCell) {
    onChange({ ...section, cells: section.cells.map(c => c.id === updated.id ? updated : c) })
  }

  const colLabel = ['', '1 stĺpec', '2 stĺpce', '3 stĺpce', '4 stĺpce'][section.cols] ?? `${section.cols} stĺpce`

  return (
    <div className="rounded-xl border border-gray-200 overflow-visible mb-3 shadow-sm">
      {/* Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Grid</span>
          <span className="text-xs text-gray-400">· {colLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(addRowToGrid(section))}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Pridať riadok"
          >
            <Plus size={12} /> Riadok
          </button>
          <div className="w-px h-3 bg-gray-200 mx-0.5" />
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 rounded transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 rounded transition-colors">
            <ChevronDown size={14} />
          </button>
          <button onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Grid canvas */}
      <div
        className="p-3"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${section.cols}, 1fr)`,
          gridTemplateRows: `repeat(${getTotalRows(section.cells)}, minmax(80px, auto))`,
          gap: '8px',
        }}
      >
        {section.cells.map(cell => (
          <Cell
            key={cell.id}
            cell={cell}
            section={section}
            onUpdate={updateCell}
            onExpand={dir => onChange(expandCell(section, cell.id, dir))}
            onShrink={dir => onChange(shrinkCell(section, cell.id, dir))}
          />
        ))}
      </div>
    </div>
  )
}
