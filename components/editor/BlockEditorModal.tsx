'use client'

import { useState, useRef } from 'react'
import { X, Upload, Plus, Trash2 } from 'lucide-react'
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

// ── image_text panel ──────────────────────────────────────────────────────────

function ImageTextPanel({ block, onUpdate }: { block: Block; onUpdate: (b: Block) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const c = block.content
  function set(key: string, value: unknown) {
    onUpdate({ ...block, content: { ...c, [key]: value } })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) set('imageUrl', json.url)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <Field label="Nadpis">
        <TextInput value={(c.heading as string) ?? ''} onChange={v => set('heading', v)} placeholder="Nadpis sekcie" />
      </Field>

      <Field label="Text">
        <textarea
          value={(c.text as string) ?? ''}
          onChange={e => set('text', e.target.value)}
          placeholder="Text sekcie..."
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Môžete použiť základné HTML: &lt;b&gt;, &lt;i&gt;, &lt;br&gt;</p>
      </Field>

      <Field label="Tlačidlo — text">
        <TextInput value={(c.buttonLabel as string) ?? ''} onChange={v => set('buttonLabel', v)} placeholder="Zistiť viac (nechajte prázdne ak nechcete)" />
      </Field>

      <Field label="Tlačidlo — odkaz">
        <TextInput value={(c.buttonUrl as string) ?? ''} onChange={v => set('buttonUrl', v)} placeholder="/kontakt" />
      </Field>

      <Field label="Poloha obrázka">
        <div className="flex gap-2">
          {(['left', 'right'] as const).map(pos => (
            <button
              key={pos}
              onClick={() => set('imagePosition', pos)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                (c.imagePosition ?? 'right') === pos
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {pos === 'left' ? '← Vľavo' : 'Vpravo →'}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Obrázok">
        {!!c.imageUrl && (
          <div className="relative mb-2 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.imageUrl as string} alt="" className="w-full h-32 object-cover" />
            <button
              onClick={() => set('imageUrl', '')}
              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 text-xs border border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          <Upload size={12} />
          {uploading ? 'Nahrávam...' : c.imageUrl ? 'Zmeniť obrázok' : 'Nahrať obrázok'}
        </button>
      </Field>
    </div>
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
  image_text: 'Foto + Text',
  cta:        'CTA sekcia',
  cards:      'Karty',
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
          {block.type === 'image_text' && <ImageTextPanel block={block} onUpdate={onUpdate} />}
          {block.type === 'cta'        && <CtaPanel       block={block} onUpdate={onUpdate} />}
          {block.type === 'cards'      && <CardsPanel     block={block} onUpdate={onUpdate} />}
        </div>
      </div>
    </div>
  )
}
