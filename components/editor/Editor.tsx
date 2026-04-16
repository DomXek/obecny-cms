'use client'

import { useState, useRef } from 'react'
import {
  DndContext, DragOverlay, useSensor, useSensors, PointerSensor,
  useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Eye, Save, Plus, Check } from 'lucide-react'
import { PageLayout, CmsRow, CmsColumn, WIDGET_DEFS, WidgetType, uid } from '@/lib/types'
import Sidebar from './Sidebar'
import RowBlock from './RowBlock'
import TextEditor from './TextEditor'

const DEFAULT_LAYOUT: PageLayout = {
  nav: { position: 'center', items: [{ label: 'Domov', slug: 'domov' }] },
  hero: { title: 'Vitajte v obci', subtitle: 'Oficiálna webová stránka obce', height: 420 },
  rows: [],
}

interface Props {
  pageId: string
  pageSlug: string
  pageTitle: string
  initialLayout: PageLayout | null
}

// ─── TextEditor overlay state ─────────────────────────────────────────────────
interface EditingCell {
  rowId: string
  colId: string
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function Editor({ pageId, pageSlug, pageTitle, initialLayout }: Props) {
  const [layout, setLayout] = useState<PageLayout>(initialLayout ?? DEFAULT_LAYOUT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeWidgetType, setActiveWidgetType] = useState<WidgetType | null>(null)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // ── Save ──────────────────────────────────────────────────────────────────
  async function save() {
    setSaving(true)
    await fetch(`/api/pages/slug?slug=${pageSlug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Row helpers ───────────────────────────────────────────────────────────
  function addRow(widgetType?: WidgetType) {
    const colId = uid()
    const newRow: CmsRow = {
      id: uid(),
      columns: [{
        id: colId,
        width: 100,
        widget: widgetType
          ? { type: widgetType, content: WIDGET_DEFS[widgetType].defaultContent }
          : null,
      }],
    }
    setLayout(l => ({ ...l, rows: [...l.rows, newRow] }))
  }

  function updateRow(updated: CmsRow) {
    setLayout(l => ({ ...l, rows: l.rows.map(r => r.id === updated.id ? updated : r) }))
  }

  function deleteRow(id: string) {
    setLayout(l => ({ ...l, rows: l.rows.filter(r => r.id !== id) }))
  }

  function dropWidgetIntoCol(rowId: string, colId: string, widgetType: WidgetType) {
    setLayout(l => ({
      ...l,
      rows: l.rows.map(r =>
        r.id !== rowId ? r : {
          ...r,
          columns: r.columns.map(c =>
            c.id !== colId ? c : {
              ...c,
              widget: { type: widgetType, content: WIDGET_DEFS[widgetType].defaultContent },
            }
          ),
        }
      ),
    }))
  }

  // ── Text editing ──────────────────────────────────────────────────────────
  function getEditingCol(): CmsColumn | null {
    if (!editingCell) return null
    const row = layout.rows.find(r => r.id === editingCell.rowId)
    return row?.columns.find(c => c.id === editingCell.colId) ?? null
  }

  function updateEditingColHtml(html: string) {
    if (!editingCell) return
    setLayout(l => ({
      ...l,
      rows: l.rows.map(r =>
        r.id !== editingCell.rowId ? r : {
          ...r,
          columns: r.columns.map(c =>
            c.id !== editingCell.colId ? c : {
              ...c,
              widget: c.widget ? { ...c.widget, content: { ...c.widget.content, html } } : c.widget,
            }
          ),
        }
      ),
    }))
  }

  // ── DnD handlers ─────────────────────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    if (e.active.data.current?.from === 'sidebar') {
      setActiveWidgetType(e.active.data.current.widgetType as WidgetType)
    }
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveWidgetType(null)

    const { active, over } = e
    if (!over) return

    // ── Drop from sidebar into column ──────────────────────────────────
    if (active.data.current?.from === 'sidebar') {
      const widgetType = active.data.current.widgetType as WidgetType
      const overData = over.data.current as { rowId?: string; colId?: string } | undefined

      if (over.id === 'canvas-drop' || !overData?.rowId) {
        // Dropped onto canvas background → add new full-width row
        addRow(widgetType)
      } else if (overData.rowId && overData.colId) {
        // Dropped into a specific column
        dropWidgetIntoCol(overData.rowId, overData.colId, widgetType)
      }
      return
    }

    // ── Reorder rows ───────────────────────────────────────────────────
    const activeRow = layout.rows.find(r => r.id === active.id)
    const overRow = layout.rows.find(r => r.id === over.id)
    if (activeRow && overRow && active.id !== over.id) {
      const oldIdx = layout.rows.indexOf(activeRow)
      const newIdx = layout.rows.indexOf(overRow)
      setLayout(l => ({ ...l, rows: arrayMove(l.rows, oldIdx, newIdx) }))
    }
  }

  const editingCol = getEditingCol()

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex h-screen bg-gray-950 overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🏛</div>
              <div>
                <span className="text-sm font-semibold text-white">{pageTitle}</span>
                <span className="text-gray-500 text-sm"> — Editor</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/${pageSlug}?preview=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
              >
                <Eye size={14} /> Náhľad
              </a>
              <button
                onClick={save}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                }`}
              >
                {saved ? <><Check size={14} /> Uložené</> : <><Save size={14} /> {saving ? 'Ukladám...' : 'Uložiť'}</>}
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 overflow-y-auto bg-gray-100 py-10 px-8">
            <div className="max-w-5xl mx-auto">

              {/* Hero preview */}
              <div
                className="rounded-2xl mb-4 flex flex-col items-center justify-center text-center px-8 shadow-sm overflow-hidden relative group/hero"
                style={{
                  minHeight: layout.hero.height,
                  background: layout.hero.bgColor ?? 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                }}
              >
                <h1 className="text-4xl font-bold text-white mb-2">{layout.hero.title}</h1>
                <p className="text-blue-200 text-lg">{layout.hero.subtitle}</p>
                <div className="absolute top-3 right-3 opacity-0 group-hover/hero:opacity-100 transition-opacity">
                  <span className="text-xs bg-black/30 text-white px-2 py-1 rounded-full">Klikni pre úpravu</span>
                </div>
              </div>

              {/* Rows */}
              <SortableContext items={layout.rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {layout.rows.map((row, idx) => (
                    <RowBlock
                      key={row.id}
                      row={row}
                      isFirst={idx === 0}
                      isLast={idx === layout.rows.length - 1}
                      onUpdate={updateRow}
                      onDelete={() => deleteRow(row.id)}
                      onEdit={(rowId, colId) => setEditingCell({ rowId, colId })}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Add row button / canvas drop zone */}
              <CanvasDropZone hasRows={layout.rows.length > 0} onAddRow={() => addRow()} />
            </div>
          </div>
        </div>

        {/* Drag overlay (ghost while dragging from sidebar) */}
        <DragOverlay dropAnimation={null}>
          {activeWidgetType ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-2xl border border-blue-400 opacity-90">
              <span className="text-xl">{WIDGET_DEFS[activeWidgetType].icon}</span>
              <span className="text-sm font-semibold">{WIDGET_DEFS[activeWidgetType].label}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Text editor overlay (full screen modal) */}
        {editingCell && editingCol?.widget?.type === 'text' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden">
              <TextEditor
                html={(editingCol.widget.content.html as string) ?? ''}
                onChange={updateEditingColHtml}
                onClose={() => setEditingCell(null)}
              />
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}

// ─── Canvas Drop Zone ─────────────────────────────────────────────────────────
function CanvasDropZone({ hasRows, onAddRow }: { hasRows: boolean; onAddRow: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop' })

  return (
    <div
      ref={setNodeRef}
      onClick={onAddRow}
      className={`mt-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
        isOver
          ? 'border-blue-400 bg-blue-50 py-10'
          : hasRows
          ? 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30 py-6'
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30 py-16'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOver ? 'bg-blue-100' : 'bg-white border border-gray-200'}`}>
        <Plus size={18} className={isOver ? 'text-blue-500' : 'text-gray-400'} />
      </div>
      <span className={`text-sm font-medium transition-colors ${isOver ? 'text-blue-600' : 'text-gray-400'}`}>
        {isOver ? 'Uvoľniť pre pridanie widgetu' : 'Pridať riadok'}
      </span>
    </div>
  )
}
