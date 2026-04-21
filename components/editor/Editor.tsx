'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext, DragOverlay, useSensor, useSensors, PointerSensor,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { Eye, Save, Check, Globe, EyeOff } from 'lucide-react'
import {
  PageLayout, PageRow, ColumnSlot, LayoutKey,
  COLUMN_LAYOUTS, WIDGET_DEFS, WidgetType, uid,
  migrateLayout,
} from '@/lib/types'
import Sidebar from './Sidebar'
import RowBuilder from './RowBuilder'
import TextEditor from './TextEditor'
import HeroEditor from './HeroEditor'
import NavEditor from './NavEditor'
import SeoEditor from './SeoEditor'
import BlockEditorModal from './BlockEditorModal'
import type { Block } from '@/lib/types'

const BLOCK_EDITOR_TYPES = new Set(['cta', 'cards', 'image', 'button'])

const DEFAULT_LAYOUT: PageLayout = {
  nav:  { position: 'center', items: [{ label: 'Domov', slug: 'domov' }] },
  hero: { title: 'Vitajte', subtitle: 'Oficiálna webová stránka', height: 420 },
  rows: [],
}

interface Props {
  pageId:          string
  pageSlug:        string
  pageTitle:       string
  initialLayout:   PageLayout | null
  initialPublished?: boolean
  enabledPlugins:  string[]
}

interface EditTarget { rowId: string; colIdx: number }

// ── Main Editor ───────────────────────────────────────────────────────────────

export default function Editor({ pageId, pageSlug, pageTitle, initialLayout, initialPublished, enabledPlugins }: Props) {
  const [layout, setLayout] = useState<PageLayout>(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    migrateLayout((initialLayout ?? DEFAULT_LAYOUT) as any)
  )
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [published,    setPublished]    = useState(initialPublished ?? true)
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null)
  const [editTarget,   setEditTarget]   = useState<EditTarget | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveLayout = useCallback(async (l: PageLayout) => {
    await fetch(`/api/pages/slug?slug=${pageSlug}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ layout: l }),
    })
  }, [pageSlug])

  async function save() {
    setSaving(true)
    await saveLayout(layout)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Autosave (30s debounce) ────────────────────────────────────────────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      saveLayout(layoutRef.current)
    }, 30_000)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [layout, saveLayout])

  // ── Publish / unpublish ───────────────────────────────────────────────────
  async function togglePublish() {
    const next = !published
    setPublished(next)
    await fetch(`/api/pages?id=${pageId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_published: next }),
    })
  }

  // ── Row CRUD ──────────────────────────────────────────────────────────────
  function insertRow(index: number, rowLayout: LayoutKey, widgetType?: WidgetType) {
    const colCount = COLUMN_LAYOUTS[rowLayout].cols.length
    const columns: ColumnSlot[] = Array.from({ length: colCount }, (_, i) => ({
      id:      uid(),
      type:    i === 0 && widgetType ? widgetType : null,
      content: i === 0 && widgetType ? { ...WIDGET_DEFS[widgetType].defaultContent } : {},
    }))
    const row: PageRow = { id: uid(), layout: rowLayout, columns }
    setLayout(l => {
      const rows = [...l.rows]
      rows.splice(index, 0, row)
      return { ...l, rows }
    })
  }

  function updateRow(row: PageRow) {
    setLayout(l => ({ ...l, rows: l.rows.map(r => r.id === row.id ? row : r) }))
  }

  function deleteRow(rowId: string) {
    setLayout(l => ({ ...l, rows: l.rows.filter(r => r.id !== rowId) }))
  }

  function moveRow(rowId: string, dir: -1 | 1) {
    setLayout(l => {
      const rows = [...l.rows]
      const i = rows.findIndex(r => r.id === rowId)
      const j = i + dir
      if (j < 0 || j >= rows.length) return l
      ;[rows[i], rows[j]] = [rows[j], rows[i]]
      return { ...l, rows }
    })
  }

  // ── Slot CRUD ─────────────────────────────────────────────────────────────
  function setSlotWidget(rowId: string, colIdx: number, widgetType: WidgetType) {
    setLayout(l => ({
      ...l,
      rows: l.rows.map(r => r.id !== rowId ? r : {
        ...r,
        columns: r.columns.map((c, i) => i !== colIdx ? c : {
          ...c,
          type:    widgetType,
          content: { ...WIDGET_DEFS[widgetType].defaultContent },
        }),
      }),
    }))
  }

  function deleteSlotWidget(rowId: string, colIdx: number) {
    setLayout(l => ({
      ...l,
      rows: l.rows.map(r => r.id !== rowId ? r : {
        ...r,
        columns: r.columns.map((c, i) => i !== colIdx ? c : { ...c, type: null, content: {} }),
      }),
    }))
  }

  function updateSlotContent(content: Record<string, unknown>) {
    if (!editTarget) return
    const { rowId, colIdx } = editTarget
    setLayout(l => ({
      ...l,
      rows: l.rows.map(r => r.id !== rowId ? r : {
        ...r,
        columns: r.columns.map((c, i) => i !== colIdx ? c : { ...c, content }),
      }),
    }))
  }

  // ── Edit modal ────────────────────────────────────────────────────────────
  function handleEditWidget(rowId: string, colIdx: number) {
    const slot = layout.rows.find(r => r.id === rowId)?.columns[colIdx]
    if (!slot?.type) return
    if (slot.type === 'text' || BLOCK_EDITOR_TYPES.has(slot.type)) {
      setEditTarget({ rowId, colIdx })
    }
  }

  const editSlot = editTarget
    ? layout.rows.find(r => r.id === editTarget.rowId)?.columns[editTarget.colIdx] ?? null
    : null

  // Wrap ColumnSlot as a fake Block so BlockEditorModal keeps working unchanged
  const editBlock: Block | null = editSlot?.type
    ? { id: editSlot.id, type: editSlot.type!, col: 0, row: 0, colSpan: 12, rowSpan: 2, content: editSlot.content }
    : null

  // ── DnD ───────────────────────────────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    if (e.active.data.current?.from === 'sidebar') {
      setDraggingType(e.active.data.current.widgetType as WidgetType)
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setDraggingType(null)
    if (!over || active.data.current?.from !== 'sidebar') return
    const widgetType = active.data.current.widgetType as WidgetType
    const overId = String(over.id)

    if (overId.startsWith('ins-')) {
      // Drop on row inserter → add new single-column row
      const idx = parseInt(overId.slice(4))
      insertRow(idx, '1', widgetType)
    } else if (overId.startsWith('col-')) {
      // Drop on empty column slot → fill the slot
      const parts  = overId.split('-')   // col-{rowId}-{colIdx}
      const rowId  = parts[1]
      const colIdx = parseInt(parts[2])
      setSlotWidget(rowId, colIdx, widgetType)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full bg-gray-950 overflow-hidden">

        <Sidebar enabledPlugins={enabledPlugins} />

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base">🏛</div>
              <span className="text-sm font-semibold text-white">{pageTitle}</span>
              <span className="text-gray-600 text-sm">— Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pageSlug === 'domov' ? '/preview' : `/preview/${pageSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
              >
                <Eye size={14} /> Náhľad
              </a>
              {pageId && (
                <button
                  onClick={togglePublish}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    published
                      ? 'border-green-700 text-green-400 hover:bg-green-900/20'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {published ? <><Globe size={14} />Publikované</> : <><EyeOff size={14} />Nepublikované</>}
                </button>
              )}
              <button
                onClick={save}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                }`}
              >
                {saved
                  ? <><Check size={14} />Uložené</>
                  : <><Save size={14} />{saving ? 'Ukladám…' : 'Uložiť'}</>
                }
              </button>
            </div>
          </div>

          {/* Canvas scroll area */}
          <div className="flex-1 overflow-y-auto bg-gray-100 py-8 px-6">
            <div className="max-w-5xl mx-auto space-y-4">

              <NavEditor
                nav={layout.nav}
                onChange={nav => setLayout(l => ({ ...l, nav }))}
              />

              <HeroEditor
                hero={layout.hero}
                onChange={hero => setLayout(l => ({ ...l, hero }))}
              />

              <SeoEditor
                seo={layout.seo ?? {}}
                pageTitle={pageTitle}
                onChange={seo => setLayout(l => ({ ...l, seo }))}
              />

              <RowBuilder
                rows={layout.rows}
                isDragging={!!draggingType}
                draggingType={draggingType}
                onInsertRow={insertRow}
                onUpdateRow={updateRow}
                onDeleteRow={deleteRow}
                onMoveRow={moveRow}
                onSetWidget={setSlotWidget}
                onDeleteWidget={deleteSlotWidget}
                onEditWidget={handleEditWidget}
              />

            </div>
          </div>
        </div>

        {/* DragOverlay chip */}
        <DragOverlay dropAnimation={null}>
          {draggingType ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white shadow-2xl opacity-90 text-sm font-semibold">
              <span>{WIDGET_DEFS[draggingType].icon}</span>
              <span>{WIDGET_DEFS[draggingType].label}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Text editor modal */}
        {editSlot?.type === 'text' && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
            onClick={() => setEditTarget(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <TextEditor
                content={editSlot.content}
                onChange={updateSlotContent}
                onClose={() => setEditTarget(null)}
              />
            </div>
          </div>
        )}

        {/* Block editor panel (cta / cards) */}
        {editBlock && BLOCK_EDITOR_TYPES.has(editBlock.type) && (
          <BlockEditorModal
            block={editBlock}
            onUpdate={b => updateSlotContent(b.content)}
            onClose={() => setEditTarget(null)}
          />
        )}

      </div>
    </DndContext>
  )
}
