'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Check, Eye, EyeOff } from 'lucide-react'
import { Aktualita } from '@/lib/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  initialData: Aktualita | null
}

export default function AktualitaEditor({ initialData }: Props) {
  const router = useRouter()
  const isNew = !initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [perex, setPerex] = useState(initialData?.perex ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false)
  const [slugManual, setSlugManual] = useState(!isNew)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManual) setSlug(slugify(val))
  }

  async function save() {
    if (!title.trim()) { setError('Nadpis je povinný'); return }
    if (!slug.trim()) { setError('Slug je povinný'); return }
    setError(null)
    setSaving(true)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      perex: perex.trim() || null,
      content: content || null,
      author: author.trim() || null,
      is_published: isPublished,
      published_at: isPublished ? (initialData?.published_at ?? new Date().toISOString()) : null,
    }

    const res = isNew
      ? await fetch('/api/aktuality', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch(`/api/aktuality/${initialData!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    setSaving(false)

    if (!res.ok) {
      const err = await res.json()
      setError(err.error ?? 'Chyba pri ukladaní')
      return
    }

    if (isNew) {
      const created = await res.json()
      router.replace(`/admin/prispevky/aktuality/${created.id}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      {/* Topbar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/prispevky/aktuality')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-semibold">{isNew ? 'Nová aktualita' : 'Upraviť aktualitu'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublished(p => !p)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isPublished
                ? 'border-green-700 text-green-400 bg-green-900/20 hover:bg-green-900/40'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
            {isPublished ? 'Publikované' : 'Koncept'}
          </button>
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
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Nadpis článku"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 border-0 outline-none focus:ring-0 py-1"
            />
            <div className="h-px bg-gray-800 mt-2" />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">URL Slug</label>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-600 transition-colors">
              <span className="text-gray-600 text-sm">/aktuality/</span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
                className="flex-1 bg-transparent text-sm text-white outline-none"
                placeholder="url-clanku"
              />
            </div>
          </div>

          {/* Perex */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Perex (krátky opis)</label>
            <textarea
              value={perex}
              onChange={e => setPerex(e.target.value)}
              placeholder="Stručný opis článku — zobrazuje sa vo výpisoch…"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-600 transition-colors resize-none"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Autor</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Meno autora"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Obsah článku</label>
            <ContentEditor value={content} onChange={setContent} />
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Inline content editor ─────────────────────────────────────────────────────
function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // Set HTML only on mount — never on re-render (prevents cursor jumping to start)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    ref.current?.focus()
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-700 flex-wrap">
        {[
          { label: 'H2', action: () => exec('formatBlock', 'h2') },
          { label: 'H3', action: () => exec('formatBlock', 'h3') },
          { label: 'B', action: () => exec('bold'), style: 'font-bold' },
          { label: 'I', action: () => exec('italic'), style: 'italic' },
          { label: 'UL', action: () => exec('insertUnorderedList') },
          { label: 'OL', action: () => exec('insertOrderedList') },
          { label: '—', action: () => exec('insertHorizontalRule') },
        ].map(({ label, action, style }) => (
          <button
            key={label}
            onMouseDown={e => { e.preventDefault(); action() }}
            className={`px-2.5 py-1 text-xs rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors ${style ?? ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Editable area — uncontrolled, HTML set once on mount */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        className="min-h-64 px-4 py-3 text-sm text-gray-200 outline-none prose prose-invert prose-sm max-w-none"
      />
    </div>
  )
}
