'use client'

import { useState, useRef } from 'react'
import {
  DndContext, DragOverlay, useSensor, useSensors, PointerSensor,
  useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { Eye, Save, Check } from 'lucide-react'
import { PageLayout, Block, WIDGET_DEFS, WidgetType, uid } from '@/lib/types'
import Sidebar from './Sidebar'
import GridBlock, { COLS, ROW_H, GAP } from './GridBlock'
import TextEditor from './TextEditor'

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

// ── Calculate how many rows the grid needs ────────────────────────────────────
function gridRows(blocks: Block[]): number {
  if (blocks.length === 0) return 6
  const max = Math.max(...blocks.map(b => b.row + b.rowSpan))
  return max + 3  // a few empty rows below
}

// ── Next free row (below all existing blocks) ─────────────────────────────────
function nextRow(blocks: Block[]): number {
  if (blocks.length === 0) return 0
  return Math.max(...blocks.map(b => b.row + b.rowSpan))
}

// ── Drop Ghost ────────────────────────────────────────────────────────────────
function DropGhost({ col, row, colSpan }: { col: number; row: number; colSpan: number }) {
  return (
    <div
      className="pointer-events-none rounded-xl bg-blue-400/20 border-2 border-blue-400 border-dashed z-50"
      style={{
        gridColumn: `${col + 1} / ${col + colSpan + 1}`,
        gridRow:    `${row + 1} / ${row + 2}`,
      }}
    />
  )
}

// ── Canvas ────────────────────────────────────────────────────────────────────
function Canvas({
  blocks,
  onUpdate,
  onDelete,
  onEdit,
  dragGhost,
  canvasRef,
}: {
  blocks: Block[]
  onUpdate: (b: Block) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  dragGhost: { col: number; row: number; colSpan: number } | null
  canvasRef: React.RefObject<HTMLDivElement | null>
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })

  const rows = gridRows(blocks)

  function mergeRefs(el: HTMLDivElement | null) {
    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    setNodeRef(el)
  }

  return (
    <div
      ref={mergeRefs}
      className={`relative rounded-2xl transition-colors ${isOver ? 'bg-blue-50/60' : 'bg-white'} shadow-sm`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, ${ROW_H}px)`,
        gap: `${GAP}px`,
        padding: `${GAP}px`,
        minHeight: `${rows * (ROW_H + GAP) + GAP}px`,
      }}
    >
      {/* Subtle column guide lines (always visible) */}
      {Array.from({ length: COLS }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg bg-gray-50 border border-gray-100 pointer-events-none"
          style={{
            gridColumn: `${i + 1} / ${i + 2}`,
            gridRow: `1 / ${rows + 1}`,
          }}
        />
      ))}

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

      {/* Drop ghost */}
      {dragGhost && <DropGhost {...dragGhost} />}
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function Editor({ pageId, pageSlug, pageTitle, initialLayout }: Props) {
  const [layout, setLayout] = useState<PageLayout>(
    initialLayout?.blocks ? initialLayout : DEFAULT_LAYOUT
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null)
  const [dragGhost, setDragGhost] = useState<{ col: number; row: number; colSpan: number } | null>(null)
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

  // ── Block helpers ─────────────────────────────────────────────────────────
  function updateBlock(updated: Block) {
    setLayout(l => ({ ...l, blocks: l.blocks.map(b => b.id === updated.id ? updated : b) }))
  }

  function deleteBlock(id: string) {
    setLayout(l => ({ ...l, blocks: l.blocks.filter(b => b.id !== id) }))
  }

  function addBlock(type: WidgetType, col: number) {
    const colSpan = Math.min(6, COLS - col)
    const block: Block = {
      id: uid(),
      type,
      col,
      row: nextRow(layout.blocks),
      colSpan,
      rowSpan: 2,
      content: { ...WIDGET_DEFS[type].defaultContent },
    }
    setLayout(l => ({ ...l, blocks: [...l.blocks, block] }))
  }

  // ── Calculate ghost position while dragging ───────────────────────────────
  function calcGhostCol(clientX: number): number {
    if (!canvasRef.current) return 0
    const rect = canvasRef.current.getBoundingClientRect()
    const relX = clientX - rect.left - GAP
    const cw = (rect.width - 2 * GAP - (COLS - 1) * GAP) / COLS
    return Math.max(0, Math.min(COLS - 1, Math.floor(relX / (cw + GAP))))
  }

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    if (e.active.data.current?.from === 'sidebar') {
      setDraggingType(e.active.data.current.widgetType as WidgetType)
    }
  }

  function onDragMove(e: { activatorEvent: Event; delta: { x: number; y: number } }) {
    if (!draggingType) return
    const ae = e.activatorEvent as MouseEvent
    const col = calcGhostCol(ae.clientX + e.delta.x)
    const colSpan = Math.min(6, COLS - col)
    setDragGhost({ col, row: nextRow(layout.blocks), colSpan })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setDraggingType(null)
    setDragGhost(null)

    if (active.data.current?.from === 'sidebar' && over?.id === 'canvas') {
      const ae = e.activatorEvent as MouseEvent
      const col = calcGhostCol(ae.clientX + e.delta.x)
      addBlock(active.data.current.widgetType as WidgetType, col)
    }
  }

  // ── Text editing ──────────────────────────────────────────────────────────
  const editingBlock = editingId ? layout.blocks.find(b => b.id === editingId) ?? null : null

  function updateEditingHtml(html: string) {
    if (!editingId) return
    setLayout(l => ({
      ...l,
      blocks: l.blocks.map(b =>
        b.id === editingId ? { ...b, content: { ...b.content, html } } : b
      ),
    }))
  }

  function handleEdit(id: string) {
    const block = layout.blocks.find(b => b.id === id)
    if (block?.type === 'text') setEditingId(id)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragMove={onDragMove as never}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-screen bg-gray-950 overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">🏛</div>
              <span className="text-sm font-semibold text-white">{pageTitle}</span>
              <span className="text-gray-600 text-sm hidden sm:inline">— Page Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/${pageSlug}?preview=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
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

              {/* Hero */}
              <div
                className="rounded-2xl flex flex-col items-center justify-center text-center px-10 shadow-sm"
                style={{
                  minHeight: layout.hero.height,
                  background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                }}
              >
                <h1 className="text-4xl font-bold text-white mb-2">{layout.hero.title}</h1>
                <p className="text-blue-200 text-lg">{layout.hero.subtitle}</p>
              </div>

              {/* Grid canvas */}
              <Canvas
                blocks={layout.blocks}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onEdit={handleEdit}
                dragGhost={dragGhost}
                canvasRef={canvasRef}
              />

              {layout.blocks.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-2">
                  Pretiahnite widget zo sidebaru na canvas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {draggingType ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-2xl opacity-90">
              <span className="text-xl">{WIDGET_DEFS[draggingType].icon}</span>
              <span className="text-sm font-semibold">{WIDGET_DEFS[draggingType].label}</span>
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
      </div>
    </DndContext>
  )
}
