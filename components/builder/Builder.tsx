'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Eye, Save, Plus, X, AlignLeft, AlignCenter, AlignRight,
  Trash2, ChevronUp, ChevronDown, Columns, GripVertical,
} from 'lucide-react'
import {
  PageLayout, NavPosition, Section, HeroConfig, WidgetType,
  WIDGETS, DEFAULT_LAYOUT,
} from './types'
import TextWidgetEditor from './widgets/TextWidgetEditor'

// ─── Nav Block ────────────────────────────────────────────────────────────────

function NavBlock({
  nav,
  onChange,
}: {
  nav: import('./types').NavConfig
  onChange: (n: import('./types').NavConfig) => void
}) {
  const [open, setOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newSlug, setNewSlug] = useState('')

  const opts: { val: NavPosition; icon: React.ReactNode; tip: string }[] = [
    { val: 'left',   icon: <AlignLeft size={14} />,   tip: 'Vľavo' },
    { val: 'center', icon: <AlignCenter size={14} />, tip: 'Stred' },
    { val: 'right',  icon: <AlignRight size={14} />,  tip: 'Vpravo' },
  ]

  const items = nav.items ?? [
    { slug: 'domov', label: 'Domov' },
    { slug: 'o-obci', label: 'O obci' },
    { slug: 'aktuality', label: 'Aktuality' },
    { slug: 'kontakt', label: 'Kontakt' },
  ]

  const justify = nav.position === 'center' ? 'justify-center'
    : nav.position === 'right' ? 'justify-end' : 'justify-start'

  function addItem() {
    if (!newLabel.trim() || !newSlug.trim()) return
    onChange({ ...nav, items: [...items, { label: newLabel.trim(), slug: newSlug.trim() }] })
    setNewLabel('')
    setNewSlug('')
  }

  function removeItem(idx: number) {
    onChange({ ...nav, items: items.filter((_, i) => i !== idx) })
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const arr = [...items]
    const j = idx + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    onChange({ ...nav, items: arr })
  }

  function updateLabel(idx: number, label: string) {
    onChange({ ...nav, items: items.map((it, i) => i === idx ? { ...it, label } : it) })
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Navigácia</span>
        <div className="flex items-center gap-2">
          {/* Position selector */}
          <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
            {opts.map(o => (
              <button key={o.val} onClick={() => onChange({ ...nav, position: o.val })} title={o.tip}
                className={`p-1.5 rounded-md transition-all ${nav.position === o.val ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                {o.icon}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${open ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Upraviť menu
          </button>
        </div>
      </div>

      {/* Nav preview */}
      <div className="bg-[#154a8a] h-14 flex items-center px-8">
        <div className={`flex items-center gap-8 w-full ${justify}`}>
          {items.map(it => (
            <span key={it.slug} className="text-white/80 text-xs font-medium">{it.label}</span>
          ))}
        </div>
      </div>

      {/* Edit panel */}
      {open && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-3">
          <p className="text-xs text-gray-500">Položky menu — poradie zodpovedá navigácii</p>

          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronUp size={12} /></button>
                  <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronDown size={12} /></button>
                </div>
                <input
                  value={item.label}
                  onChange={e => updateLabel(idx, e.target.value)}
                  className="flex-1 text-sm text-gray-800 bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-xs text-gray-400 font-mono">/{item.slug}</span>
                <button onClick={() => removeItem(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="flex gap-2 pt-1">
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="Názov položky"
              className="flex-1 text-sm text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              onKeyDown={e => e.key === 'Enter' && addItem()}
            />
            <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
              placeholder="slug"
              className="w-32 text-sm text-gray-800 font-mono border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              onKeyDown={e => e.key === 'Enter' && addItem()}
            />
            <button onClick={addItem}
              className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hero Block ───────────────────────────────────────────────────────────────

function HeroBlock({
  config,
  onChange,
}: {
  config: HeroConfig
  onChange: (c: HeroConfig) => void
}) {
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    isDragging.current = true
    startY.current = e.clientY
    startH.current = config.height

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = e.clientY - startY.current
      onChange({ ...config, height: Math.max(120, Math.min(700, startH.current + delta)) })
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hero sekcia</span>
        <span className="text-xs text-gray-400 tabular-nums">{config.height} px</span>
      </div>

      <div
        className="relative flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-700 to-gray-900"
        style={{ height: config.height }}
      >
        <input
          value={config.title}
          onChange={e => onChange({ ...config, title: e.target.value })}
          placeholder="Hlavný nadpis"
          className="bg-transparent text-white font-bold text-3xl text-center w-full max-w-xl outline-none border-b border-white/0 hover:border-white/30 focus:border-white/50 pb-1 transition-colors px-4"
        />
        <input
          value={config.subtitle}
          onChange={e => onChange({ ...config, subtitle: e.target.value })}
          placeholder="Podnadpis (voliteľné)"
          className="bg-transparent text-white/60 text-sm text-center w-full max-w-md outline-none border-b border-white/0 hover:border-white/30 focus:border-white/50 pb-1 transition-colors px-4"
        />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onHandleMouseDown}
        className="h-5 bg-gray-100 hover:bg-blue-50 border-t border-gray-200 hover:border-blue-300 flex items-center justify-center cursor-ns-resize group transition-colors select-none"
        title="Ťahaj pre zmenu výšky"
      >
        <div className="w-16 h-1 bg-gray-300 group-hover:bg-blue-400 rounded-full transition-colors" />
      </div>
    </div>
  )
}

// ─── Widget Picker ────────────────────────────────────────────────────────────

function WidgetPicker({
  onSelect,
  onClose,
}: {
  onSelect: (w: WidgetType) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-blue-400 p-3 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-gray-700">Vyber widget</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 flex-1 content-start">
        {(Object.entries(WIDGETS) as [WidgetType, typeof WIDGETS[WidgetType]][]).map(([key, w]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-opacity hover:opacity-80 ${w.bg} ${w.text}`}
          >
            <span className="text-base leading-none">{w.icon}</span>
            {w.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  isFirst,
  isLast,
  rowRef,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: Section
  isFirst: boolean
  isLast: boolean
  rowRef: React.RefObject<HTMLDivElement>
  onChange: (s: Section) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [picking, setPicking] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const isTwoCol = section.columns.length === 2

  function split() {
    onChange({
      ...section,
      columns: [
        { width: 50, widget: section.columns[0].widget, content: section.columns[0].content },
        { width: 50, widget: 'empty' },
      ],
    })
  }

  function merge() {
    onChange({ ...section, columns: [{ ...section.columns[0], width: 100 }] })
  }

  function setWidget(colIdx: number, widget: WidgetType) {
    const cols = section.columns.map((c, i) =>
      i === colIdx ? { ...c, widget, content: {} } : c
    )
    onChange({ ...section, columns: cols })
    setPicking(null)
    if (widget === 'text') setEditing(colIdx)
  }

  function setContent(colIdx: number, html: string) {
    const cols = section.columns.map((c, i) =>
      i === colIdx ? { ...c, content: { ...c.content, html } } : c
    )
    onChange({ ...section, columns: cols })
  }

  function handleColClick(colIdx: number) {
    const col = section.columns[colIdx]
    if (col.widget === 'text') {
      setEditing(colIdx)
    } else {
      setPicking(colIdx)
    }
  }

  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const onMove = (e: MouseEvent) => {
      if (!rowRef.current) return
      const rect = rowRef.current.getBoundingClientRect()
      const rel = ((e.clientX - rect.left) / rect.width) * 100
      const w1 = Math.max(20, Math.min(80, rel))
      onChange({
        ...section,
        columns: [
          { ...section.columns[0], width: w1 },
          { ...section.columns[1], width: 100 - w1 },
        ],
      })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
      {/* Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Sekcia</span>
        <div className="flex items-center gap-1">
          <button
            onClick={isTwoCol ? merge : split}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title={isTwoCol ? 'Spojiť do 1 stĺpca' : 'Rozdeliť na 2 stĺpce'}
          >
            <Columns size={12} />
            {isTwoCol ? '1 stĺpec' : '2 stĺpce'}
          </button>
          <div className="w-px h-3 bg-gray-200 mx-0.5" />
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 rounded transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 rounded transition-colors">
            <ChevronDown size={14} />
          </button>
          <button onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex min-h-[120px] relative" ref={rowRef}>
        {section.columns.map((col, i) => {
          const w = WIDGETS[col.widget]
          const isText = col.widget === 'text'
          const hasContent = isText && col.content?.html

          return (
            <div
              key={i}
              className={`relative cursor-pointer transition-colors ${
                isText && hasContent
                  ? 'bg-white hover:bg-gray-50'
                  : `${w.bg} flex items-center justify-center hover:opacity-90`
              }`}
              style={{ width: `${col.width}%` }}
              onClick={() => editing !== i && handleColClick(i)}
            >
              {/* Text widget: show content preview or placeholder */}
              {isText ? (
                hasContent ? (
                  <div
                    className="p-4 prose prose-sm max-w-none w-full pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: col.content!.html! }}
                  />
                ) : (
                  <div className={`text-center select-none ${w.text}`}>
                    <div className="text-2xl mb-1">{w.icon}</div>
                    <div className="text-xs font-semibold">{w.label}</div>
                    <div className="text-xs opacity-60 mt-1">Kliknite pre editáciu</div>
                  </div>
                )
              ) : (
                <div className={`text-center select-none ${w.text}`}>
                  <div className="text-2xl mb-1">{w.icon}</div>
                  <div className="text-xs font-semibold">{w.label}</div>
                  {isTwoCol && (
                    <div className="text-xs opacity-50 mt-0.5">{Math.round(col.width)}%</div>
                  )}
                </div>
              )}

              {/* Widget picker overlay */}
              {picking === i && (
                <WidgetPicker
                  onSelect={widget => setWidget(i, widget)}
                  onClose={() => setPicking(null)}
                />
              )}

              {/* Text editor overlay */}
              {editing === i && (
                <TextWidgetEditor
                  html={col.content?.html ?? ''}
                  onChange={html => setContent(i, html)}
                  onDone={() => setEditing(null)}
                />
              )}

              {/* Change widget button (shown on hover for non-empty, non-editing) */}
              {col.widget !== 'empty' && editing !== i && picking !== i && (
                <button
                  onClick={e => { e.stopPropagation(); setPicking(i) }}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-white/80 hover:bg-white border border-gray-200 rounded-md text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  style={{ opacity: undefined }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '')}
                >
                  Zmeniť
                </button>
              )}
            </div>
          )
        })}

        {/* Column resize handle */}
        {isTwoCol && editing === null && (
          <div
            onMouseDown={onHandleMouseDown}
            className="absolute top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize group z-10"
            style={{ left: `calc(${section.columns[0].width}% - 10px)` }}
          >
            <div className="w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors absolute" />
            <div className="w-5 h-10 bg-white border border-gray-200 group-hover:border-blue-400 rounded-full flex items-center justify-center shadow-sm transition-colors relative">
              <GripVertical size={10} className="text-gray-400 group-hover:text-blue-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export default function Builder({
  pageId,
  pageSlug,
  pageTitle,
  initialLayout,
}: {
  pageId: string
  pageSlug: string
  pageTitle: string
  initialLayout: PageLayout | null
}) {
  const [layout, setLayout] = useState<PageLayout>(initialLayout ?? DEFAULT_LAYOUT)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  // refs per row (for column resize — track container width)
  const rowRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map())
  function getRowRef(id: string) {
    if (!rowRefs.current.has(id)) {
      rowRefs.current.set(id, { current: null })
    }
    return rowRefs.current.get(id)!
  }

  function addSection() {
    setLayout(l => ({
      ...l,
      sections: [
        ...l.sections,
        { id: crypto.randomUUID(), columns: [{ width: 100, widget: 'empty' }] },
      ],
    }))
  }

  function updateSection(id: string, updated: Section) {
    setLayout(l => ({ ...l, sections: l.sections.map(s => s.id === id ? updated : s) }))
  }

  function deleteSection(id: string) {
    setLayout(l => ({ ...l, sections: l.sections.filter(s => s.id !== id) }))
  }

  function moveSection(id: string, dir: -1 | 1) {
    setLayout(l => {
      const arr = [...l.sections]
      const i = arr.findIndex(s => s.id === id)
      const j = i + dir
      if (j < 0 || j >= arr.length) return l
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...l, sections: arr }
    })
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/pages/${pageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout }),
    })
    setSaving(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f0f0] overflow-hidden">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/stranky"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="font-semibold text-gray-900 text-sm">{pageTitle}</span>
            <span className="text-gray-400 text-sm"> — Page builder</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`/${pageSlug}?preview=1`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye size={14} /> Zobraziť
          </a>
          <button onClick={save} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              savedMsg
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50'
            }`}>
            <Save size={14} />
            {saving ? 'Ukladám...' : savedMsg ? '✓ Uložené' : 'Uložiť'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto py-8 px-12">
        <div className="max-w-4xl mx-auto">
          <NavBlock
            nav={layout.nav}
            onChange={nav => setLayout(l => ({ ...l, nav }))}
          />

          <HeroBlock
            config={layout.hero}
            onChange={hero => setLayout(l => ({ ...l, hero }))}
          />

          {layout.sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              isFirst={idx === 0}
              isLast={idx === layout.sections.length - 1}
              rowRef={getRowRef(section.id) as React.RefObject<HTMLDivElement>}
              onChange={s => updateSection(section.id, s)}
              onDelete={() => deleteSection(section.id)}
              onMoveUp={() => moveSection(section.id, -1)}
              onMoveDown={() => moveSection(section.id, 1)}
            />
          ))}

          <button
            onClick={addSection}
            className="w-full py-5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 mt-1"
          >
            <Plus size={16} />
            Pridať sekciu
          </button>
        </div>
      </div>
    </div>
  )
}
