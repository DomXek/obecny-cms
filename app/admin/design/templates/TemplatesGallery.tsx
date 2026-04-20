'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutTemplate, Check, ChevronRight, Zap } from 'lucide-react'
import { Template, WIDGET_COLORS } from '@/lib/templates'
import { PageLayout, WIDGET_DEFS, COLUMN_LAYOUTS } from '@/lib/types'

// ── Mini preview — row-based ──────────────────────────────────────────────────

function MiniPreview({ layout }: { layout: PageLayout }) {
  const rows = layout.rows
  if (!rows?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-600 flex items-center justify-center w-full h-32">
        <span className="text-xs text-gray-600">Prázdny canvas</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden bg-gray-800 w-full p-2 space-y-1.5">
      {rows.map(row => {
        const widths = COLUMN_LAYOUTS[row.layout]?.cols ?? [100]
        return (
          <div key={row.id} className="flex gap-1">
            {row.columns.map((col, i) => {
              const color = col.type ? (WIDGET_COLORS[col.type] ?? '#6b7280') : '#374151'
              return (
                <div
                  key={col.id}
                  className="rounded flex items-center justify-center gap-1 py-2 px-1"
                  style={{ flex: widths[i] ?? 1, background: color + '33', border: `1px solid ${color}55` }}
                >
                  {col.type && (
                    <>
                      <span style={{ fontSize: 9, color, opacity: 0.9 }}>{WIDGET_DEFS[col.type]?.icon}</span>
                      <span style={{ fontSize: 7, color, opacity: 0.75, fontWeight: 600 }}>{WIDGET_DEFS[col.type]?.label}</span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Widget type legend ────────────────────────────────────────────────────────

function RowLegend({ layout }: { layout: PageLayout }) {
  const types = [...new Set((layout.rows ?? []).flatMap(r => r.columns.map(c => c.type)).filter(Boolean))]
  if (!types.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {types.map(t => (
        <span
          key={t}
          className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
          style={{ background: WIDGET_COLORS[t!] + '22', color: WIDGET_COLORS[t!] }}
        >
          {WIDGET_DEFS[t!]?.icon} {WIDGET_DEFS[t!]?.label}
        </span>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  templates:     Template[]
  currentLayout: PageLayout | null
}

const CATEGORIES = ['Odporúčané', 'Základné', 'Pokročilé']

export default function TemplatesGallery({ templates, currentLayout }: Props) {
  const router   = useRouter()
  const [applying, setApplying] = useState<string | null>(null)
  const [applied,  setApplied]  = useState<string | null>(null)

  async function applyTemplate(template: Template) {
    if (!confirm(`Aplikovať template „${template.name}"? Aktuálne rozloženie bude nahradené.`)) return
    setApplying(template.id)
    await fetch('/api/pages/slug?slug=domov', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ layout: template.layout }),
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
          Otvoriť Builder <ChevronRight size={13} />
        </button>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-gray-500 text-sm mb-6">
          Vyberte rozloženie a aplikujte ho na stránku. Potom ho môžete ľubovoľne upraviť.
        </p>

        {CATEGORIES.map(cat => {
          const group = templates.filter(t => t.category === cat)
          if (!group.length) return null
          return (
            <div key={cat} className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.map(template => {
                  const rowCount   = template.layout.rows?.length ?? 0
                  const isApplied  = applied  === template.id
                  const isApplying = applying === template.id

                  return (
                    <div
                      key={template.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors flex flex-col gap-3"
                    >
                      <MiniPreview layout={template.layout} />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                          <span className="text-xs text-gray-600 shrink-0">
                            {rowCount === 0 ? 'Bez riadkov' : `${rowCount} ${rowCount === 1 ? 'riadok' : rowCount < 5 ? 'riadky' : 'riadkov'}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>
                        <RowLegend layout={template.layout} />
                      </div>

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
