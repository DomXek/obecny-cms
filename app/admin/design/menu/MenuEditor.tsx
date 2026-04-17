'use client'

import { useState } from 'react'
import {
  Menu, Save, Check, Plus, Trash2, ChevronDown,
  ChevronRight, GripVertical, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import { NavConfig, NavItem, NavStyle } from '@/lib/types'
import { uid } from '@/lib/types'

// ── Style definitions ─────────────────────────────────────────────────────────
const STYLES: { id: NavStyle; label: string; desc: string; levels: number; preview: React.ReactNode }[] = [
  {
    id: 'simple',
    label: 'Jednoduchá',
    desc: '1 úroveň — priame odkazy v lište',
    levels: 1,
    preview: (
      <div className="flex items-center gap-3 px-3 py-2 bg-white rounded border border-gray-200 text-xs text-gray-600">
        <span className="font-semibold text-gray-800 text-[10px]">🏛 Obec</span>
        <div className="flex gap-2 flex-1 justify-center">
          {['Domov', 'Aktuality', 'Kontakt'].map(l => (
            <span key={l} className="px-2 py-0.5 hover:bg-gray-100 rounded text-[10px]">{l}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'dropdown',
    label: 'Dropdown',
    desc: '2 úrovne — hover odhalí podmenu',
    levels: 2,
    preview: (
      <div className="text-[10px] text-gray-600">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-white rounded-t border border-gray-200">
          <span className="font-semibold text-gray-800">🏛 Obec</span>
          <div className="flex gap-2 flex-1 justify-center">
            <span className="px-2 py-0.5 rounded">Domov</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center gap-0.5">Samospráva <ChevronDown size={8}/></span>
            <span className="px-2 py-0.5 rounded">Kontakt</span>
          </div>
        </div>
        <div className="ml-[72px] bg-white border border-t-0 border-gray-200 rounded-b py-1 w-28 shadow-sm">
          <div className="px-3 py-0.5 hover:bg-gray-50">Starosta</div>
          <div className="px-3 py-0.5 hover:bg-gray-50">Zastupiteľstvo</div>
          <div className="px-3 py-0.5 hover:bg-gray-50">Úrady</div>
        </div>
      </div>
    ),
  },
  {
    id: 'mega',
    label: 'Mega menu',
    desc: '3 úrovne — skupiny s nadpismi',
    levels: 3,
    preview: (
      <div className="text-[10px] text-gray-600">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-white rounded-t border border-gray-200">
          <span className="font-semibold text-gray-800">🏛 Obec</span>
          <div className="flex gap-2 flex-1 justify-center">
            <span className="px-2 py-0.5 rounded">Domov</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center gap-0.5">Samospráva <ChevronDown size={8}/></span>
            <span className="px-2 py-0.5 rounded">Kontakt</span>
          </div>
        </div>
        <div className="bg-white border border-t-0 border-gray-200 rounded-b p-2 shadow-sm flex gap-4">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Obecný úrad</div>
            <div className="text-gray-400 space-y-0.5">
              <div>Starosta</div><div>Zástupca</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-1">Dokumenty</div>
            <div className="text-gray-400 space-y-0.5">
              <div>VZN</div><div>Zápisnice</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function emptyItem(): NavItem {
  return { id: uid(), label: 'Nová položka', slug: 'nova-polozka' }
}

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Single item row ───────────────────────────────────────────────────────────
function ItemRow({
  item, depth, style, maxDepth,
  onUpdate, onDelete, onAddChild,
}: {
  item: NavItem
  depth: number
  style: NavStyle
  maxDepth: number
  onUpdate: (updated: NavItem) => void
  onDelete: () => void
  onAddChild: () => void
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = (item.children?.length ?? 0) > 0
  const canHaveChildren = depth < maxDepth - 1

  function updateChild(idx: number, updated: NavItem) {
    const children = [...(item.children ?? [])]
    children[idx] = updated
    onUpdate({ ...item, children })
  }

  function deleteChild(idx: number) {
    const children = (item.children ?? []).filter((_, i) => i !== idx)
    onUpdate({ ...item, children })
  }

  function addGrandchild(idx: number) {
    const children = [...(item.children ?? [])]
    children[idx] = {
      ...children[idx],
      children: [...(children[idx].children ?? []), emptyItem()],
    }
    onUpdate({ ...item, children })
  }

  const indentPx = depth * 20

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800/50 group"
        style={{ marginLeft: indentPx }}
      >
        <GripVertical size={13} className="text-gray-700 shrink-0 cursor-grab" />

        {/* Expand toggle */}
        {canHaveChildren ? (
          <button onClick={() => setOpen(o => !o)} className="text-gray-600 hover:text-gray-300 shrink-0">
            {open || hasChildren
              ? <ChevronDown size={13} />
              : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* depth indicator */}
        {depth > 0 && (
          <span className="text-gray-700 text-xs shrink-0">
            {'└'.repeat(1)}
          </span>
        )}

        {/* Label */}
        <input
          value={item.label}
          onChange={e => {
            const label = e.target.value
            onUpdate({ ...item, label, slug: slugify(label) })
          }}
          className="flex-1 bg-transparent text-sm text-white outline-none min-w-0"
          placeholder="Názov"
        />

        {/* Slug */}
        <span className="text-gray-600 text-xs">/</span>
        <input
          value={item.slug}
          onChange={e => onUpdate({ ...item, slug: e.target.value })}
          className="w-28 bg-gray-800 border border-gray-700 text-xs text-gray-400 rounded px-2 py-1 outline-none focus:border-blue-600 transition-colors"
          placeholder="slug"
        />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canHaveChildren && (
            <button
              onClick={() => { onAddChild(); setOpen(true) }}
              title="Pridať podpoložku"
              className="p-1 rounded text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-colors"
            >
              <Plus size={12} />
            </button>
          )}
          <button
            onClick={onDelete}
            title="Odstrániť"
            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {(open || hasChildren) && (item.children ?? []).map((child, idx) => (
        <ItemRow
          key={child.id}
          item={child}
          depth={depth + 1}
          style={style}
          maxDepth={maxDepth}
          onUpdate={u => updateChild(idx, u)}
          onDelete={() => deleteChild(idx)}
          onAddChild={() => addGrandchild(idx)}
        />
      ))}
    </div>
  )
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function MenuEditor({ initialNav }: { initialNav: NavConfig }) {
  const [nav, setNav] = useState<NavConfig>({
    style: initialNav.style ?? 'simple',
    position: initialNav.position ?? 'center',
    items: initialNav.items.map(i => ({ ...i, id: i.id ?? uid() })),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const style = nav.style ?? 'simple'
  const maxDepth = style === 'simple' ? 1 : style === 'dropdown' ? 2 : 3

  async function save() {
    setSaving(true)
    // Load current layout first, then patch only nav
    const res = await fetch('/api/pages/slug?slug=domov')
    const page = await res.json()
    await fetch('/api/pages/slug?slug=domov', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: { ...page.layout, nav } }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function addTopItem() {
    setNav(n => ({ ...n, items: [...n.items, emptyItem()] }))
  }

  function updateItem(idx: number, updated: NavItem) {
    setNav(n => ({ ...n, items: n.items.map((x, i) => i === idx ? updated : x) }))
  }

  function deleteItem(idx: number) {
    setNav(n => ({ ...n, items: n.items.filter((_, i) => i !== idx) }))
  }

  function addChildToItem(idx: number) {
    setNav(n => ({
      ...n,
      items: n.items.map((item, i) =>
        i === idx
          ? { ...item, children: [...(item.children ?? []), emptyItem()] }
          : item
      ),
    }))
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Menu size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Navigačné menu</span>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
          }`}
        >
          {saved ? <><Check size={14} />Uložené</> : <><Save size={14} />{saving ? 'Ukladám…' : 'Uložiť'}</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 max-w-3xl">

        {/* ── Style picker ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Štýl menu</h2>
          <div className="grid grid-cols-1 gap-3">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setNav(n => ({ ...n, style: s.id }))}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  style === s.id
                    ? 'border-blue-600 bg-blue-950/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{s.label}</span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                        {s.levels === 1 ? '1 úroveň' : s.levels === 2 ? '2 úrovne' : '3 úrovne'}
                      </span>
                      {style === s.id && (
                        <span className="text-xs text-blue-400 bg-blue-900/40 px-1.5 py-0.5 rounded">Aktívny</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
                {/* Visual preview */}
                <div className="pointer-events-none">{s.preview}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Position ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Pozícia položiek</h2>
          <div className="flex gap-2">
            {([['left', AlignLeft, 'Vľavo'], ['center', AlignCenter, 'Centrum'], ['right', AlignRight, 'Vpravo']] as const).map(
              ([pos, Icon, label]) => (
                <button
                  key={pos}
                  onClick={() => setNav(n => ({ ...n, position: pos }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    nav.position === pos
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* ── Items tree ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Položky menu
              {maxDepth > 1 && (
                <span className="ml-2 text-gray-600 normal-case font-normal">
                  — kliknite <Plus size={10} className="inline" /> pre pridanie podpoložky
                </span>
              )}
            </h2>
            <button
              onClick={addTopItem}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={13} /> Pridať položku
            </button>
          </div>

          {nav.items.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-gray-800 rounded-xl">
              Žiadne položky — kliknite „Pridať položku"
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl py-2 px-1 space-y-0.5">
              {/* Header row */}
              <div className="flex items-center gap-2 px-3 pb-2 border-b border-gray-800 mb-1">
                <span className="text-xs text-gray-600 ml-8">Názov</span>
                <span className="flex-1" />
                <span className="text-xs text-gray-600 w-32 text-center">URL slug</span>
                <span className="w-12" />
              </div>
              {nav.items.map((item, idx) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  depth={0}
                  style={style}
                  maxDepth={maxDepth}
                  onUpdate={u => updateItem(idx, u)}
                  onDelete={() => deleteItem(idx)}
                  onAddChild={() => addChildToItem(idx)}
                />
              ))}
            </div>
          )}

          {/* Depth legend */}
          {maxDepth > 1 && (
            <div className="mt-3 flex items-start gap-4 text-xs text-gray-600">
              <span>Úrovne:</span>
              <span className="text-gray-500">▸ Level 1 = hlavné položky</span>
              {maxDepth >= 2 && <span className="text-gray-500">▸ Level 2 = dropdown</span>}
              {maxDepth >= 3 && <span className="text-gray-500">▸ Level 3 = skupiny v mega menu</span>}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
