'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Block } from '@/lib/types'

interface Props {
  block: Block
  onUpdate: (b: Block) => void
  onClose: () => void
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
    />
  )
}

// ── CTA panel ─────────────────────────────────────────────────────────────────

function CtaPanel({ block, onUpdate }: { block: Block; onUpdate: (b: Block) => void }) {
  const c = block.content
  function set(key: string, value: unknown) {
    onUpdate({ ...block, content: { ...c, [key]: value } })
  }

  return (
    <div>
      <Field label="Nadpis">
        <TextInput value={(c.heading as string) ?? ''} onChange={v => set('heading', v)} placeholder="Kontaktujte nás" />
      </Field>

      <Field label="Podtext">
        <TextInput value={(c.subtext as string) ?? ''} onChange={v => set('subtext', v)} placeholder="Sme tu pre vás každý deň" />
      </Field>

      <Field label="Tlačidlo — text">
        <TextInput value={(c.buttonLabel as string) ?? ''} onChange={v => set('buttonLabel', v)} placeholder="Zistiť viac" />
      </Field>

      <Field label="Tlačidlo — odkaz">
        <TextInput value={(c.buttonUrl as string) ?? ''} onChange={v => set('buttonUrl', v)} placeholder="/kontakt" />
      </Field>

      <Field label="Zarovnanie">
        <div className="flex gap-2">
          {(['left', 'center'] as const).map(a => (
            <button
              key={a}
              onClick={() => set('align', a)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                (c.align ?? 'center') === a
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {a === 'left' ? '⬅ Vľavo' : '⬛ Stred'}
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-600">
        Farba pozadia CTA sekcie sa riadi nastaveniami v <strong>Design → Štýl</strong> (primárna farba).
      </div>
    </div>
  )
}

// ── Cards panel ───────────────────────────────────────────────────────────────

interface CardItem { icon: string; title: string; desc: string }

function CardsPanel({ block, onUpdate }: { block: Block; onUpdate: (b: Block) => void }) {
  const c = block.content
  const items = (c.items as CardItem[]) ?? []

  function setItems(newItems: CardItem[]) {
    onUpdate({ ...block, content: { ...c, items: newItems } })
  }

  function setColumns(col: number) {
    onUpdate({ ...block, content: { ...c, columns: col } })
  }

  function updateItem(i: number, patch: Partial<CardItem>) {
    setItems(items.map((item, idx) => idx === i ? { ...item, ...patch } : item))
  }

  function addItem() {
    setItems([...items, { icon: '⭐', title: 'Nová karta', desc: 'Popis...' }])
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <Field label="Počet stĺpcov">
        <div className="flex gap-2">
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setColumns(n)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                (c.columns ?? 3) === n
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Karty">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.icon}
                  onChange={e => updateItem(i, { icon: e.target.value })}
                  className="w-12 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-lg outline-none"
                  placeholder="⭐"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItem(i, { title: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                  placeholder="Názov karty"
                />
                <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea
                value={item.desc}
                onChange={e => updateItem(i, { desc: e.target.value })}
                placeholder="Krátky popis..."
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 resize-none"
              />
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full py-2 text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={12} /> Pridať kartu
          </button>
        </div>
      </Field>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

const TITLES: Partial<Record<string, string>> = {
  cta:   'CTA sekcia',
  cards: 'Karty',
}

export default function BlockEditorModal({ block, onUpdate, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="w-96 bg-white shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">{TITLES[block.type] ?? block.type}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {block.type === 'cta'   && <CtaPanel   block={block} onUpdate={onUpdate} />}
          {block.type === 'cards'      && <CardsPanel     block={block} onUpdate={onUpdate} />}
        </div>
      </div>
    </div>
  )
}
