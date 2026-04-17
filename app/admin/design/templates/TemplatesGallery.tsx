'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutTemplate, Check, ChevronRight, Zap } from 'lucide-react'
import { Template, WIDGET_COLORS } from '@/lib/templates'
import { PageLayout, WIDGET_DEFS } from '@/lib/types'
import { COLS, ROW_H, GAP } from '@/lib/gridUtils'

// ── Mini grid preview ─────────────────────────────────────────────────────────
const PREVIEW_W = 240
const PREVIEW_H = 160
const PREVIEW_ROWS = 13

function MiniPreview({ layout }: { layout: PageLayout }) {
  const blocks = layout.blocks
  if (blocks.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-gray-600 flex items-center justify-center"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        <span className="text-xs text-gray-600">Prázdny canvas</span>
      </div>
    )
  }

  const colW = (PREVIEW_W - (COLS - 1) * 2) / COLS
  const rowH = (PREVIEW_H - (PREVIEW_ROWS - 1) * 2) / PREVIEW_ROWS

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-gray-800"
      style={{ width: PREVIEW_W, height: PREVIEW_H }}
    >
      {/* column guides */}
      {Array.from({ length: COLS }).map((_, c) => (
        <div
          key={c}
          className="absolute rounded-sm"
          style={{
            left: c * (colW + 2),
            top: 0,
            width: colW,
            height: PREVIEW_H,
            background: 'rgba(255,255,255,0.03)',
          }}
        />
      ))}
      {/* blocks */}
      {blocks.map(b => {
        const color = WIDGET_COLORS[b.type] ?? '#6b7280'
        return (
          <div
            key={b.id}
            className="absolute rounded flex items-center justify-center gap-1"
            style={{
              left:   b.col * (colW + 2),
              top:    b.row * (rowH + 2),
              width:  b.colSpan * colW + (b.colSpan - 1) * 2,
              height: b.rowSpan * rowH + (b.rowSpan - 1) * 2,
              background: color + '33',
              border: `1.5px solid ${color}66`,
            }}
          >
            <span style={{ fontSize: 9, color, fontWeight: 600, opacity: 0.9 }}>
              {WIDGET_DEFS[b.type]?.icon}
            </span>
            <span style={{ fontSize: 8, color, opacity: 0.8 }}>
              {WIDGET_DEFS[b.type]?.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────
function BlockLegend({ layout }: { layout: PageLayout }) {
  const types = [...new Set(layout.blocks.map(b => b.type))]
  if (types.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {types.map(t => (
        <span
          key={t}
          className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
          style={{ background: WIDGET_COLORS[t] + '22', color: WIDGET_COLORS[t] }}
        >
          {WIDGET_DEFS[t]?.icon} {WIDGET_DEFS[t]?.label}
        </span>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  templates: Template[]
  currentLayout: PageLayout | null
}

const CATEGORIES = ['Odporúčané', 'Základné', 'Pokročilé']

export default function TemplatesGallery({ templates, currentLayout }: Props) {
  const router = useRouter()
  const [applying, setApplying] = useState<string | null>(null)
  const [applied, setApplied]   = useState<string | null>(null)

  async function applyTemplate(template: Template) {
    if (!confirm(`Aplikovať template „${template.name}"? Aktuálne rozloženie wireframu bude nahradené.`)) return
    setApplying(template.id)

    await fetch('/api/pages/slug?slug=domov', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: template.layout }),
    })

    setApplying(null)
    setApplied(template.id)
    setTimeout(() => setApplied(null), 2500)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Templates</span>
        </div>
        <button
          onClick={() => router.push('/admin/design/wireframe')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Otvoriť Wireframe <ChevronRight size={13} />
        </button>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-gray-500 text-sm mb-6">
          Vyberte rozloženie a aplikujte ho na wireframe. Potom ho môžete ľubovoľne upraviť.
        </p>

        {CATEGORIES.map(cat => {
          const group = templates.filter(t => t.category === cat)
          if (group.length === 0) return null
          return (
            <div key={cat} className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.map(template => {
                  const isApplied  = applied === template.id
                  const isApplying = applying === template.id

                  return (
                    <div
                      key={template.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors flex flex-col gap-3"
                    >
                      {/* Mini preview */}
                      <MiniPreview layout={template.layout} />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                          <span className="text-xs text-gray-600 shrink-0">
                            {template.layout.blocks.length === 0
                              ? 'Bez blokov'
                              : `${template.layout.blocks.length} ${template.layout.blocks.length === 1 ? 'blok' : template.layout.blocks.length < 5 ? 'bloky' : 'blokov'}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>
                        <BlockLegend layout={template.layout} />
                      </div>

                      {/* Apply button */}
                      <button
                        onClick={() => applyTemplate(template)}
                        disabled={!!applying}
                        className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${
                          isApplied
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white disabled:opacity-40'
                        }`}
                      >
                        {isApplied ? (
                          <><Check size={14} /> Aplikované</>
                        ) : isApplying ? (
                          'Aplikujem…'
                        ) : (
                          <><Zap size={14} /> Použiť template</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
