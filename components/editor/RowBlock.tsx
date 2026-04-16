'use client'

import { useState, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { GripVertical, Trash2, Plus, X } from 'lucide-react'
import { CmsRow, CmsColumn, WIDGET_DEFS, uid, WidgetType } from '@/lib/types'

// ─── Column Width Presets ─────────────────────────────────────────────────────
const WIDTH_PRESETS = [25, 33, 50, 67, 75, 100]

// ─── Widget Preview ───────────────────────────────────────────────────────────
function WidgetPreview({ col, onRemove, onEdit }: { col: CmsColumn; onRemove: () => void; onEdit: () => void }) {
  if (!col.widget) return null
  const def = WIDGET_DEFS[col.widget.type]
  const isText = col.widget.type === 'text'
  const html = col.widget.content.html as string | undefined

  return (
    <div className="group/widget relative h-full">
      {isText && html ? (
        <div
          className="p-4 prose prose-sm max-w-none text-gray-800 h-full cursor-text"
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={onEdit}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 py-8 h-full cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={onEdit}
        >
          <span className="text-3xl">{def.icon}</span>
          <span className="text-sm font-medium">{def.label}</span>
        </div>
      )}
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 shadow-sm opacity-0 group-hover/widget:opacity-100 transition-opacity"
      >
        <X size={11} />
      </button>
    </div>
  )
}

// ─── Column drop zone ─────────────────────────────────────────────────────────
function ColumnZone({ col, rowId, onUpdate, onEdit }: {
  col: CmsColumn
  rowId: string
  onUpdate: (updated: CmsColumn) => void
  onEdit: (col: CmsColumn) => void
}) {
  const dropId = `col-${rowId}-${col.id}`
  const { setNodeRef, isOver } = useDroppable({ id: dropId, data: { rowId, colId: col.id } })

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-xl min-h-[120px] border-2 transition-all ${
        col.widget
          ? 'border-gray-200 bg-white'
          : isOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'
      }`}
      style={{ width: `${col.width}%` }}
    >
      {col.widget ? (
        <WidgetPreview
          col={col}
          onRemove={() => onUpdate({ ...col, widget: null })}
          onEdit={() => onEdit(col)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[120px] gap-2 text-gray-400">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Plus size={18} className={isOver ? 'text-blue-500' : 'text-gray-400'} />
          </div>
          <span className="text-xs font-medium">{isOver ? 'Uvoľniť tu' : 'Pretiahnite widget'}</span>
        </div>
      )}
    </div>
  )
}

// ─── RowBlock ─────────────────────────────────────────────────────────────────
export default function RowBlock({
  row,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onEdit,
}: {
  row: CmsRow
  isFirst: boolean
  isLast: boolean
  onUpdate: (updated: CmsRow) => void
  onDelete: () => void
  onEdit: (rowId: string, colId: string) => void
}) {
  const [showColPicker, setShowColPicker] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function updateCol(colId: string, updated: CmsColumn) {
    onUpdate({ ...row, columns: row.columns.map(c => c.id === colId ? updated : c) })
  }

  function addColumn(width: number) {
    const remaining = 100 - row.columns.reduce((s, c) => s + c.width, 0)
    if (remaining <= 0) return
    const actualWidth = Math.min(width, remaining)
    const newCol: CmsColumn = { id: uid(), width: actualWidth, widget: null }
    onUpdate({ ...row, columns: [...row.columns, newCol] })
    setShowColPicker(false)
  }

  function removeColumn(colId: string) {
    const updated = row.columns.filter(c => c.id !== colId)
    if (updated.length === 0) { onDelete(); return }
    // redistribute width
    const total = updated.reduce((s, c) => s + c.width, 0)
    const scaled = updated.map(c => ({ ...c, width: Math.round((c.width / total) * 100) }))
    onUpdate({ ...row, columns: scaled })
  }

  const totalWidth = row.columns.reduce((s, c) => s + c.width, 0)
  const canAddColumn = totalWidth < 100

  return (
    <div ref={setNodeRef} style={style} className="group/row relative">
      {/* Row hover toolbar */}
      <div className="absolute -top-8 left-0 right-0 h-8 flex items-center justify-between px-2
        opacity-0 group-hover/row:opacity-100 transition-opacity z-10
        pointer-events-none group-hover/row:pointer-events-auto">
        <div className="flex items-center gap-1 bg-blue-600 rounded-lg px-2 py-1">
          <button
            {...attributes}
            {...listeners}
            className="text-blue-200 hover:text-white cursor-grab active:cursor-grabbing p-0.5"
            title="Presunúť riadok"
          >
            <GripVertical size={14} />
          </button>
          <span className="text-xs text-blue-200 font-medium px-1">Riadok</span>
          {canAddColumn && (
            <button
              onClick={() => setShowColPicker(v => !v)}
              className="text-blue-200 hover:text-white p-0.5 transition-colors"
              title="Pridať stĺpec"
            >
              <Plus size={13} />
            </button>
          )}
          <div className="w-px h-3 bg-blue-500 mx-0.5" />
          <button
            onClick={onDelete}
            className="text-blue-200 hover:text-red-300 p-0.5 transition-colors"
            title="Zmazať riadok"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Column picker popup */}
        {showColPicker && (
          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-30 flex gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">Šírka stĺpca:</span>
            {WIDTH_PRESETS.filter(w => w <= 100 - totalWidth + 0.1).map(w => (
              <button key={w} onClick={() => addColumn(w)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-xs font-semibold text-gray-700 transition-colors">
                {w}%
              </button>
            ))}
            <button onClick={() => setShowColPicker(false)} className="text-gray-400 hover:text-gray-700 ml-1">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Row body */}
      <div className={`rounded-xl border-2 transition-colors ${isDragging ? 'border-blue-300 bg-blue-50' : 'border-transparent group-hover/row:border-blue-200'} p-1`}>
        <div className="flex gap-2 items-stretch">
          {row.columns.map(col => (
            <div key={col.id} className="group/col relative" style={{ width: `${col.width}%` }}>
              <ColumnZone
                col={col}
                rowId={row.id}
                onUpdate={updated => updateCol(col.id, updated)}
                onEdit={c => onEdit(row.id, c.id)}
              />
              {row.columns.length > 1 && (
                <button
                  onClick={() => removeColumn(col.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover/col:opacity-100 transition-opacity z-10"
                  title="Odobrať stĺpec"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
