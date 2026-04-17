'use client'

import { useState } from 'react'
import { Plus, X, GripVertical, AlignLeft, AlignCenter, AlignRight, Settings } from 'lucide-react'
import { NavConfig, NavItem, uid } from '@/lib/types'

interface Props {
  nav: NavConfig
  onChange: (n: NavConfig) => void
}

function NavPreview({ nav }: { nav: NavConfig }) {
  const justify =
    nav.position === 'left' ? 'justify-start' :
    nav.position === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div className={`flex items-center gap-6 ${justify} flex-1`}>
      {(nav.items ?? []).map(item => (
        <span key={item.slug} className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer whitespace-nowrap">
          {item.label}
        </span>
      ))}
      {(nav.items ?? []).length === 0 && (
        <span className="text-sm text-gray-300 italic">Žiadne položky menu</span>
      )}
    </div>
  )
}

export default function NavEditor({ nav, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  function setPosition(pos: NavConfig['position']) {
    onChange({ ...nav, position: pos })
  }

  function addItem() {
    const label = `Položka ${(nav.items?.length ?? 0) + 1}`
    const slug = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
    onChange({ ...nav, items: [...(nav.items ?? []), { label, slug }] })
    setEditingIdx((nav.items?.length ?? 0))
  }

  function updateItem(idx: number, item: NavItem) {
    const items = [...(nav.items ?? [])]
    items[idx] = item
    onChange({ ...nav, items })
  }

  function removeItem(idx: number) {
    const items = (nav.items ?? []).filter((_, i) => i !== idx)
    onChange({ ...nav, items })
  }

  // Simple drag reorder
  function onDragStart(idx: number) { setDragIdx(idx) }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setOverIdx(idx)
  }
  function onDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
    const items = [...(nav.items ?? [])]
    const [moved] = items.splice(dragIdx, 1)
    items.splice(idx, 0, moved)
    onChange({ ...nav, items })
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div className="group/nav relative">
      {/* ── Nav bar preview ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm mb-1">
        {/* Logo placeholder */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">🏛</div>
          <span className="font-semibold text-gray-800 text-sm">Obec</span>
        </div>

        <NavPreview nav={nav} />

        {/* Edit button — visible on hover */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            open
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 opacity-0 group-hover/nav:opacity-100'
          }`}
        >
          <Settings size={12} />
          Upraviť menu
        </button>
      </div>

      {/* ── Settings panel ───────────────────────────────────────────────── */}
      {open && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-5 mb-3">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold text-gray-800">Navigačné menu</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={14} />
            </button>
          </div>

          <div className="flex gap-5">
            {/* Left: items list */}
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Položky menu</div>
              <div className="space-y-1.5 mb-3">
                {(nav.items ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => onDragOver(e, idx)}
                    onDrop={() => onDrop(idx)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                      overIdx === idx && dragIdx !== idx
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="cursor-grab text-gray-300 hover:text-gray-500">
                      <GripVertical size={14} />
                    </div>
                    {editingIdx === idx ? (
                      <div className="flex-1 flex gap-1.5">
                        <input
                          autoFocus
                          value={item.label}
                          onChange={e => updateItem(idx, { ...item, label: e.target.value })}
                          onBlur={() => setEditingIdx(null)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingIdx(null) }}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                          placeholder="Názov"
                        />
                        <input
                          value={item.slug}
                          onChange={e => updateItem(idx, { ...item, slug: e.target.value })}
                          className="w-28 border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono text-gray-500 focus:outline-none focus:border-blue-400"
                          placeholder="slug"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingIdx(idx)}
                        className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                      >
                        {item.label}
                        <span className="text-gray-400 font-mono text-xs ml-2">/{item.slug}</span>
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-gray-300 hover:text-red-400 p-0.5 rounded transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-2 w-full py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/40 transition-all"
              >
                <Plus size={13} /> Pridať položku
              </button>
            </div>

            {/* Right: position + preview */}
            <div className="w-40 shrink-0">
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Pozícia</div>
              <div className="flex flex-col gap-1.5">
                {([
                  { pos: 'left'   as const, icon: <AlignLeft size={14} />,   label: 'Vľavo' },
                  { pos: 'center' as const, icon: <AlignCenter size={14} />, label: 'Stred' },
                  { pos: 'right'  as const, icon: <AlignRight size={14} />,  label: 'Vpravo' },
                ]).map(({ pos, icon, label }) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      nav.position === pos
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
