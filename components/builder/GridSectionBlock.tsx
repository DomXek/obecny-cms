'use client'

import { useState } from 'react'
import {
  ChevronUp, ChevronDown, Trash2, X, Plus,
} from 'lucide-react'
import {
  GridSection, GridCell, WidgetType, WIDGETS,
  addRowToGrid, getTotalRows,
} from './types'
import TextWidgetEditor from './widgets/TextWidgetEditor'

// ─── Widget Picker Panel ───────────────────────────────────────────────────────
function WidgetPanel({ onSelect, onClose }: { onSelect: (w: WidgetType) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white rounded-xl shadow-2xl border-2 border-blue-400 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-blue-500">
        <span className="text-sm font-semibold text-white">Vyber widget</span>
        <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded hover:bg-blue-600 transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto">
        {(Object.entries(WIDGETS) as [WidgetType, typeof WIDGETS[WidgetType]][]).map(([key, w]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${w.bg} ${w.text}`}
          >
            <span className="text-2xl leading-none">{w.icon}</span>
            <span className="leading-tight">{w.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Cell ──────────────────────────────────────────────────────────────────────
function Cell({
  cell,
  onUpdate,
}: {
  cell: GridCell
  onUpdate: (updated: GridCell) => void
}) {
  const [picking, setPicking] = useState(false)
  const [editing, setEditing] = useState(false)
  const w = WIDGETS[cell.widget]
  const isEmpty = cell.widget === 'empty'
  const isText = cell.widget === 'text'
  const hasTextContent = isText && cell.content?.html

  function handleSelect(widget: WidgetType) {
    onUpdate({ ...cell, widget, content: widget === 'text' ? (cell.content ?? {}) : {} })
    setPicking(false)
    if (widget === 'text') setEditing(true)
  }

  return (
    <div
      className="relative group/cell"
      style={{
        gridColumn: `${cell.col + 1} / ${cell.col + cell.colSpan + 1}`,
        gridRow:    `${cell.row + 1} / ${cell.row + cell.rowSpan + 1}`,
        minHeight: '120px',
      }}
    >
      {isEmpty ? (
        <button
          onClick={() => setPicking(true)}
          className="w-full h-full min-h-[120px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-400 hover:bg-blue-50/40 group/add"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover/add:bg-blue-100 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-gray-400 group-hover/add:text-blue-500 transition-colors" />
          </div>
          <span className="text-xs text-gray-400 group-hover/add:text-blue-500 transition-colors font-medium">Pridať widget</span>
        </button>
      ) : (
        <div
          onClick={() => { if (!editing && !picking) { if (isText) setEditing(true); else setPicking(true) } }}
          className={`w-full h-full min-h-[120px] rounded-xl overflow-hidden cursor-pointer relative transition-all ${
            hasTextContent
              ? 'bg-white border-2 border-gray-200 group-hover/cell:border-blue-300'
              : `${w.bg} group-hover/cell:opacity-95 border-2 border-transparent group-hover/cell:border-blue-300`
          }`}
        >
          {hasTextContent ? (
            <div
              className="p-5 prose prose-sm max-w-none text-gray-800 pointer-events-none"
              dangerouslySetInnerHTML={{ __html: cell.content!.html! }}
            />
          ) : (
            <div className={`flex flex-col items-center justify-center h-full py-10 gap-2 select-none ${w.text}`}>
              <span className="text-3xl">{w.icon}</span>
              <span className="text-sm font-semibold">{w.label}</span>
            </div>
          )}

          {/* Hover: change button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover/cell:opacity-100 transition-opacity">
            <button
              onMouseDown={e => { e.stopPropagation(); setPicking(true) }}
              className="px-2.5 py-1 bg-white/95 backdrop-blur border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 shadow-sm transition-colors"
            >
              Zmeniť
            </button>
          </div>
        </div>
      )}

      {/* Widget picker overlay */}
      {picking && (
        <div className="absolute inset-0 z-50">
          <WidgetPanel onSelect={handleSelect} onClose={() => setPicking(false)} />
        </div>
      )}

      {/* Text editor overlay */}
      {editing && (
        <div className="absolute inset-0 z-50">
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
    <div className="group/section relative mb-4">
      {/* Elementor-style: blue top toolbar appears on hover */}
      <div className="absolute -top-8 left-0 right-0 h-8 flex items-center justify-between px-3 bg-blue-500 rounded-t-lg
        opacity-0 group-hover/section:opacity-100 transition-opacity z-10 pointer-events-none group-hover/section:pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-4 h-4 opacity-60 cursor-grab">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>
          <span className="text-xs font-medium text-white/90">Sekcia · {colLabel}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1 text-white/70 hover:text-white disabled:opacity-25 hover:bg-blue-600 rounded transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1 text-white/70 hover:text-white disabled:opacity-25 hover:bg-blue-600 rounded transition-colors">
            <ChevronDown size={14} />
          </button>
          <div className="w-px h-3 bg-white/20 mx-0.5" />
          <button onClick={onDelete}
            className="p-1 text-white/70 hover:text-red-300 hover:bg-blue-600 rounded transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Section body with blue outline on hover */}
      <div className="rounded-xl border-2 border-gray-100 group-hover/section:border-blue-300 transition-colors bg-white/50">
        {/* Grid canvas */}
        <div
          className="p-3"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${section.cols}, 1fr)`,
            gridTemplateRows: `repeat(${getTotalRows(section.cells)}, minmax(120px, auto))`,
            gap: '10px',
          }}
        >
          {section.cells.map(cell => (
            <Cell key={cell.id} cell={cell} onUpdate={updateCell} />
          ))}
        </div>

        {/* Add row button — bottom of section, visible on hover */}
        <div className="px-3 pb-3 opacity-0 group-hover/section:opacity-100 transition-opacity">
          <button
            onClick={() => onChange(addRowToGrid(section))}
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> Pridať riadok
          </button>
        </div>
      </div>
    </div>
  )
}
