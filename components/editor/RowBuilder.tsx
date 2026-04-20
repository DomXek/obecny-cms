'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { ChevronUp, ChevronDown, Trash2, Edit2, X, Plus } from 'lucide-react'
import {
  PageRow, ColumnSlot, LayoutKey, WidgetType,
  COLUMN_LAYOUTS, WIDGET_DEFS, changeRowLayout, uid,
} from '@/lib/types'

// ── Layout icon — proportional bars ──────────────────────────────────────────

function LayoutIcon({ cols }: { cols: number[] }) {
  return (
    <div className="flex gap-[2px] w-7 h-3.5 items-stretch">
      {cols.map((c, i) => (
        <div key={i} className="bg-current rounded-[2px]" style={{ flex: c }} />
      ))}
    </div>
  )
}

// ── Widget picker popup ───────────────────────────────────────────────────────

function WidgetPickerPopup({
  onSelect,
  onClose,
}: {
  onSelect: (t: WidgetType) => void
  onClose: () => void
}) {
  const types = Object.keys(WIDGET_DEFS) as WidgetType[]
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-2 space-y-0.5">
        {types.map(type => {
          const def = WIDGET_DEFS[type]
          return (
            <button
              key={type}
              onClick={() => { onSelect(type); onClose() }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
            >
              <span className="text-base">{def.icon}</span>
              <div>
                <div className="text-xs font-medium text-gray-800">{def.label}</div>
                <div className="text-[10px] text-gray-400">{def.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── Widget preview (inside filled slot) ──────────────────────────────────────

function WidgetPreview({ slot }: { slot: ColumnSlot }) {
  const def = WIDGET_DEFS[slot.type as WidgetType]

  if (slot.type === 'text' && slot.content.html) {
    return (
      <div
        className="p-3 prose prose-sm max-w-none text-gray-700 overflow-hidden pointer-events-none text-xs leading-relaxed"
        dangerouslySetInnerHTML={{ __html: slot.content.html as string }}
      />
    )
  }
  if (slot.type === 'cta') {
    return (
      <div className="h-full min-h-[80px] flex flex-col items-center justify-center gap-1.5 bg-blue-600 p-3">
        <div className="text-xs font-bold text-white text-center">
          {(slot.content.heading as string) ?? 'CTA'}
        </div>
        <div className="px-2 py-0.5 bg-white rounded text-[10px] font-semibold text-blue-700">
          {(slot.content.buttonLabel as string) ?? 'Tlačidlo'}
        </div>
      </div>
    )
  }
  if (slot.type === 'cards') {
    const items = (slot.content.items as { icon: string; title: string }[]) ?? []
    return (
      <div className="p-3">
        <div className="text-[10px] text-gray-400 mb-2">{items.length} kariet</div>
        <div className="flex gap-1.5 flex-wrap">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="text-sm">{item.icon}</div>
              <div className="text-[9px] text-gray-600 truncate max-w-[52px]">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[80px] gap-2 text-gray-400 p-4">
      <span className="text-3xl">{def?.icon}</span>
      <span className="text-xs font-medium">{def?.label}</span>
    </div>
  )
}

// ── Column slot ───────────────────────────────────────────────────────────────

function ColumnSlotUI({
  slot,
  slotId,
  isDragging,
  widthFlex,
  onSetWidget,
  onEdit,
  onDelete,
}: {
  slot: ColumnSlot
  slotId: string
  isDragging: boolean
  widthFlex: number
  onSetWidget: (t: WidgetType) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isEmpty = !slot.type
  const { setNodeRef, isOver } = useDroppable({ id: slotId, disabled: !isEmpty })
  const [showPicker, setShowPicker] = useState(false)

  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        className={`relative rounded-xl border-2 border-dashed min-h-[100px] flex items-center justify-center transition-colors ${
          isOver
            ? 'border-blue-400 bg-blue-50'
            : isDragging
            ? 'border-blue-200 bg-blue-50/40'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
        style={{ flex: widthFlex }}
      >
        {isDragging ? (
          <span className={`text-xs font-medium ${isOver ? 'text-blue-600' : 'text-gray-400'}`}>
            {isOver ? 'Pustiť sem' : 'Drop tu'}
          </span>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowPicker(true)}
              className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center">
                <Plus size={12} />
              </div>
              <span className="text-[10px] font-medium">Pridať widget</span>
            </button>
            {showPicker && (
              <WidgetPickerPopup
                onSelect={onSetWidget}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="group/slot relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 transition-colors cursor-pointer"
      style={{ flex: widthFlex }}
      onClick={onEdit}
    >
      <WidgetPreview slot={slot} />

      {/* Hover controls */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="Editovať"
        >
          <Edit2 size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-red-500 transition-colors"
          title="Odstrániť widget"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  )
}

// ── Row inserter — "+", also acts as a drop zone ──────────────────────────────

function RowInserter({
  inserterId,
  isDragging,
  onInsert,
}: {
  inserterId: string
  isDragging: boolean
  onInsert: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: inserterId })

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className={`mx-1 my-1 rounded-xl border-2 border-dashed h-12 flex items-center justify-center text-xs font-medium transition-all ${
          isOver
            ? 'border-blue-400 bg-blue-50 text-blue-600'
            : 'border-gray-200 bg-transparent text-gray-400'
        }`}
      >
        {isOver ? 'Pustiť — nový riadok' : 'Nový riadok'}
      </div>
    )
  }

  return (
    <div className="group/ins relative h-8 flex items-center justify-center my-0.5">
      <div className="absolute inset-x-0 top-1/2 -translate-y-px h-px bg-transparent group-hover/ins:bg-gray-200 transition-colors" />
      <button
        onClick={onInsert}
        className="relative z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all opacity-0 group-hover/ins:opacity-100 shadow-sm text-sm font-light"
        title="Pridať riadok"
      >
        +
      </button>
    </div>
  )
}

// ── Single row ────────────────────────────────────────────────────────────────

function RowEditorComp({
  row,
  isFirst,
  isLast,
  isDragging,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSetWidget,
  onDeleteWidget,
  onEditWidget,
}: {
  row: PageRow
  isFirst: boolean
  isLast: boolean
  isDragging: boolean
  onUpdate: (r: PageRow) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onSetWidget: (colIdx: number, t: WidgetType) => void
  onDeleteWidget: (colIdx: number) => void
  onEditWidget: (colIdx: number) => void
}) {
  const widths = COLUMN_LAYOUTS[row.layout]?.cols ?? [100]

  return (
    <div className="group/row bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-100 rounded-t-xl">

        {/* Layout buttons */}
        <div className="flex items-center gap-0.5">
          {Object.entries(COLUMN_LAYOUTS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => onUpdate(changeRowLayout(row, key as LayoutKey))}
              title={def.label}
              className={`p-1.5 rounded-lg transition-colors ${
                row.layout === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-300 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <LayoutIcon cols={def.cols} />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Move + delete — appear on row hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default transition-colors"
            title="Posunúť hore"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default transition-colors"
            title="Posunúť dole"
          >
            <ChevronDown size={14} />
          </button>
          <div className="w-px h-3 bg-gray-200 mx-1" />
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Zmazať riadok"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-3 p-3">
        {row.columns.map((col, i) => (
          <ColumnSlotUI
            key={col.id}
            slot={col}
            slotId={`col-${row.id}-${i}`}
            isDragging={isDragging}
            widthFlex={widths[i] ?? 100}
            onSetWidget={t => onSetWidget(i, t)}
            onEdit={() => onEditWidget(i)}
            onDelete={() => onDeleteWidget(i)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Layout picker modal (shown when clicking inserter) ────────────────────────

function LayoutPickerModal({
  onPick,
  onClose,
}: {
  onPick: (l: LayoutKey) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-80"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-800">Vyberte rozloženie</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(COLUMN_LAYOUTS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => { onPick(key as LayoutKey); onClose() }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="flex gap-1 w-16 h-5 text-gray-500">
                {def.cols.map((c, i) => (
                  <div key={i} className="bg-current rounded-sm" style={{ flex: c }} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">{def.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Row builder (main export) ─────────────────────────────────────────────────

interface Props {
  rows: PageRow[]
  isDragging: boolean       // true while sidebar widget is being dragged
  draggingType: WidgetType | null
  onInsertRow: (index: number, layout: LayoutKey, widgetType?: WidgetType) => void
  onUpdateRow: (row: PageRow) => void
  onDeleteRow: (rowId: string) => void
  onMoveRow: (rowId: string, dir: -1 | 1) => void
  onSetWidget: (rowId: string, colIdx: number, t: WidgetType) => void
  onDeleteWidget: (rowId: string, colIdx: number) => void
  onEditWidget: (rowId: string, colIdx: number) => void
}

export default function RowBuilder({
  rows,
  isDragging,
  draggingType,
  onInsertRow,
  onUpdateRow,
  onDeleteRow,
  onMoveRow,
  onSetWidget,
  onDeleteWidget,
  onEditWidget,
}: Props) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

  function handleInserterClick(index: number) {
    setPickerIndex(index)
  }

  function handleLayoutPick(layout: LayoutKey) {
    if (pickerIndex === null) return
    onInsertRow(pickerIndex, layout)
    setPickerIndex(null)
  }

  return (
    <div className="select-none">
      {/* Top inserter */}
      <RowInserter
        inserterId="ins-0"
        isDragging={isDragging}
        onInsert={() => handleInserterClick(0)}
      />

      {rows.map((row, i) => (
        <div key={row.id}>
          <RowEditorComp
            row={row}
            isFirst={i === 0}
            isLast={i === rows.length - 1}
            isDragging={isDragging}
            onUpdate={onUpdateRow}
            onDelete={() => onDeleteRow(row.id)}
            onMoveUp={() => onMoveRow(row.id, -1)}
            onMoveDown={() => onMoveRow(row.id, 1)}
            onSetWidget={(colIdx, t) => onSetWidget(row.id, colIdx, t)}
            onDeleteWidget={colIdx => onDeleteWidget(row.id, colIdx)}
            onEditWidget={colIdx => onEditWidget(row.id, colIdx)}
          />
          <RowInserter
            inserterId={`ins-${i + 1}`}
            isDragging={isDragging}
            onInsert={() => handleInserterClick(i + 1)}
          />
        </div>
      ))}

      {rows.length === 0 && !isDragging && (
        <div className="text-center py-16 text-sm text-gray-400">
          Kliknite na <strong>+</strong> alebo pretiahnite widget zo sidebaru
        </div>
      )}

      {pickerIndex !== null && (
        <LayoutPickerModal
          onPick={handleLayoutPick}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </div>
  )
}
