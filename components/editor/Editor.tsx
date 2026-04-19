'use client'

import { useState, useRef } from 'react'
import {
  DndContext, DragOverlay, useSensor, useSensors, PointerSensor,
  useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { Eye, Save, Check } from 'lucide-react'
import { PageLayout, Block, WIDGET_DEFS, WidgetType, uid } from '@/lib/types'
import { COLS, ROW_H, GAP, xToCol, yToRow } from '@/lib/gridUtils'
import Sidebar from './Sidebar'
import GridBlock from './GridBlock'
import TextEditor from './TextEditor'
import HeroEditor from './HeroEditor'
import NavEditor from './NavEditor'
import BlockEditorModal from './BlockEditorModal'

const BLOCK_EDITOR_TYPES = new Set(['image_text', 'cta', 'cards'])

const DEFAULT_LAYOUT: PageLayout = {
  nav: { position: 'center', items: [{ label: 'Domov', slug: 'domov' }] },
  hero: { title: 'Vitajte v obci', subtitle: 'Oficiálna webová stránka obce', height: 420 },
  blocks: [],
}

interface Props {
  pageId: string
  pageSlug: string
  pageTitle: string
  initialLayout: PageLayout | null
}

interface Ghost {
  col: number
  row: number
  colSpan: number
  rowSpan: number
}

// ── How many rows the grid needs ──────────────────────────────────────────────
function gridRows(blocks: Block[]): number {
  if (blocks.length === 0) return 8
  return Math.max(...blocks.map(b => b.row + b.rowSpan)) + 4
}

// ── Canvas ────────────────────────────────────────────────────────────────────
function Canvas({
  blocks, ghost, canvasRef, onUpdate, onDelete, onEdit,
}: {
  blocks: Block[]
  ghost: Ghost | null
  canvasRef: React.RefObject<HTMLDivElement | null>
  onUpdate: (b: Block) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}) {
  const rows = gridRows(blocks)
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })

  function mergeRef(el: HTMLDivElement | null) {
    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    setNodeRef(el)
  }

  return (
    <div
      ref={mergeRef}
      className={`relative rounded-2xl transition-colors ${isOver ? 'ring-2 ring-blue-300' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridAutoRows: `${ROW_H}px`,
        gap: `${GAP}px`,
        padding: `${GAP}px`,
        minHeight: `${rows * (ROW_H + GAP) + GAP}px`,
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
      }}
    >
      {/* Column guide cells — placed via CSS Grid, behind everything */}
      {Array.from({ length: COLS }).map((_, c) => (
        <div
          key={`guide-${c}`}
          aria-hidden="true"
          className="pointer-events-none rounded-lg"
          style={{
            gridColumn: `${c + 1} / ${c + 2}`,
            gridRow: `1 / ${rows + 1}`,
            background: 'rgba(0,0,0,0.018)',
            border: '1px dashed rgba(0,0,0,0.06)',
          }}
        />
      ))}

      {/* Drop ghost */}
      {ghost && (
        <div
          className="pointer-events-none rounded-xl border-2 border-blue-400 border-dashed bg-blue-50 z-50"
          style={{
            gridColumn: `${ghost.col + 1} / ${ghost.col + ghost.colSpan + 1}`,
            gridRow:    `${ghost.row + 1} / ${ghost.row + ghost.rowSpan + 1}`,
          }}
        />
      )}

      {/* Blocks */}
      {blocks.map(block => (
        <GridBlock
          key={block.id}
          block={block}
          canvasEl={canvasRef.current ?? null}
          onUpdate={onUpdate}
          onDelete={() => onDelete(block.id)}
          onEdit={() => onEdit(block.id)}
        />
      ))}
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function Editor({ pageId, pageSlug, pageTitle, initialLayout }: Props) {
  const [layout, setLayout] = useState<PageLayout>(
    initialLayout?.blocks !== undefined ? initialLayout : DEFAULT_LAYOUT
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // ── Save ─────────────────────────────────────────────────────────────────
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

  // ── Block CRUD ────────────────────────────────────────────────────────────
  function updateBlock(b: Block) {
    setLayout(l => ({ ...l, blocks: l.blocks.map(x => x.id === b.id ? b : x) }))
  }

  function deleteBlock(id: string) {
    setLayout(l => ({ ...l, blocks: l.blocks.filter(b => b.id !== id) }))
  }

  function addBlock(type: WidgetType, col: number, row: number) {
    const colSpan = Math.min(6, COLS - col)
    setLayout(l => ({
      ...l,
      blocks: [...l.blocks, {
        id: uid(),
        type,
        col,
        row,
        colSpan,
        rowSpan: 2,
        content: { ...WIDGET_DEFS[type].defaultContent },
      }],
    }))
  }

  // ── Compute drop position from drag event ─────────────────────────────────
  function dropPos(e: { activatorEvent: Event; delta: { x: number; y: number } }) {
    if (!canvasRef.current) return { col: 0, row: 0 }
    const ae = e.activatorEvent as MouseEvent
    const cx = ae.clientX + e.delta.x
    const cy = ae.clientY + e.delta.y
    return {
      col: xToCol(cx, canvasRef.current),
      row: yToRow(cy, canvasRef.current),
    }
  }

  // ── DnD ───────────────────────────────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    if (e.active.data.current?.from === 'sidebar') {
      setDraggingType(e.active.data.current.widgetType as WidgetType)
    }
  }

  function onDragMove(e: { activatorEvent: Event; delta: { x: number; y: number }; over: { id: string } | null }) {
    if (!draggingType || !canvasRef.current) return
    if (e.over?.id !== 'canvas') { setGhost(null); return }
    const { col, row } = dropPos(e)
    const colSpan = Math.min(6, COLS - col)
    setGhost({ col, row, colSpan, rowSpan: 2 })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setDraggingType(null)
    setGhost(null)
    if (active.data.current?.from === 'sidebar' && over?.id === 'canvas') {
      const { col, row } = dropPos(e as never)
      addBlock(active.data.current.widgetType as WidgetType, col, row)
    }
  }

  // ── Text editing ──────────────────────────────────────────────────────────
  const editingBlock = editingId ? layout.blocks.find(b => b.id === editingId) ?? null : null

  function handleEdit(id: string) {
    const b = layout.blocks.find(x => x.id === id)
    if (!b) return
    if (b.type === 'text' || BLOCK_EDITOR_TYPES.has(b.type)) setEditingId(id)
  }

  function updateEditingHtml(html: string) {
    if (!editingId) return
    setLayout(l => ({
      ...l,
      blocks: l.blocks.map(b =>
        b.id === editingId ? { ...b, content: { ...b.content, html } } : b
      ),
    }))
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragMove={onDragMove as never}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full bg-gray-950 overflow-hidden">

        <Sidebar />

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
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                }`}
              >
                {saved ? <><Check size={14} />Uložené</> : <><Save size={14} />{saving ? 'Ukladám…' : 'Uložiť'}</>}
              </button>
            </div>
          </div>

          {/* Canvas scroll area */}
          <div className="flex-1 overflow-y-auto bg-gray-100 py-8 px-6">
            <div className="max-w-5xl mx-auto space-y-4">

              {/* Nav */}
              <NavEditor
                nav={layout.nav}
                onChange={nav => setLayout(l => ({ ...l, nav }))}
              />

              {/* Hero */}
              <HeroEditor
                hero={layout.hero}
                onChange={hero => setLayout(l => ({ ...l, hero }))}
              />

              {/* Grid canvas */}
              <Canvas
                blocks={layout.blocks}
                ghost={ghost}
                canvasRef={canvasRef}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onEdit={handleEdit}
              />

              {layout.blocks.length === 0 && !ghost && (
                <p className="text-center text-xs text-gray-400 py-1">
                  Pretiahnite widget zo sidebaru na canvas ↑
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drag overlay — ghost chip following cursor */}
        <DragOverlay dropAnimation={null}>
          {draggingType ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white shadow-2xl opacity-90 text-sm font-semibold">
              <span>{WIDGET_DEFS[draggingType].icon}</span>
              <span>{WIDGET_DEFS[draggingType].label}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Text editor modal */}
        {editingBlock?.type === 'text' && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
            onClick={() => setEditingId(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <TextEditor
                html={(editingBlock.content.html as string) ?? ''}
                onChange={updateEditingHtml}
                onClose={() => setEditingId(null)}
              />
            </div>
          </div>
        )}

        {/* Block editor panel (image_text / cta / cards) */}
        {editingBlock && BLOCK_EDITOR_TYPES.has(editingBlock.type) && (
          <BlockEditorModal
            block={editingBlock}
            onUpdate={updateBlock}
            onClose={() => setEditingId(null)}
          />
        )}
      </div>
    </DndContext>
  )
}
