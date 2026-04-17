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

// ── Rich content editor ───────────────────────────────────────────────────────
function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref       = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]   = useState(false)
  const [embedOpen, setEmbedOpen]   = useState(false)
  const [embedCode, setEmbedCode]   = useState('')
  const [linkOpen, setLinkOpen]     = useState(false)
  const [linkUrl, setLinkUrl]       = useState('')
  const savedRange = useRef<Range | null>(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    ref.current?.focus()
    sync()
  }

  function sync() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  function restoreSelection() {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  // ── Image upload ─────────────────────────────────────────────────────────
  async function handleImageFile(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const { url, error } = await res.json()
    setUploading(false)
    if (error || !url) return
    restoreSelection()
    document.execCommand('insertHTML', false,
      `<figure style="margin:1.5em 0;text-align:center">
        <img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:var(--radius,8px)" />
      </figure>`)
    ref.current?.focus()
    sync()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImageFile(file)
    e.target.value = ''
  }

  // Drag & drop images into editor
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageFile(file)
  }

  // ── Embed / iframe insert ────────────────────────────────────────────────
  function insertEmbed() {
    if (!embedCode.trim()) return
    restoreSelection()
    // Wrap in a non-editable div so the raw HTML renders safely
    const wrapped = `<div class="embed-block" contenteditable="false" style="margin:1.5em 0;overflow:hidden;border-radius:var(--radius,8px)">${embedCode.trim()}</div><p><br></p>`
    document.execCommand('insertHTML', false, wrapped)
    ref.current?.focus()
    sync()
    setEmbedCode('')
    setEmbedOpen(false)
  }

  // ── Link insert ──────────────────────────────────────────────────────────
  function insertLink() {
    const url = linkUrl.trim()
    if (!url) return
    restoreSelection()
    document.execCommand('createLink', false, url.startsWith('http') ? url : 'https://' + url)
    const links = ref.current?.querySelectorAll('a:not([target])')
    links?.forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener') })
    ref.current?.focus()
    sync()
    setLinkUrl('')
    setLinkOpen(false)
  }

  const SEP = <div className="w-px h-4 bg-gray-700 mx-0.5" />

  const TB_BTN = 'px-2 py-1 text-xs rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-1'
  const TB_ACTIVE = 'bg-gray-700 text-white'

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-700 flex-wrap">

        {/* Text format */}
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','p')}} className={TB_BTN} title="Odsek">P</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','h2')}} className={TB_BTN} title="Nadpis 2">H2</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','h3')}} className={TB_BTN} title="Nadpis 3">H3</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','blockquote')}} className={TB_BTN} title="Citát">❝</button>
        {SEP}

        {/* Inline format */}
        <button onMouseDown={e=>{e.preventDefault();exec('bold')}}   className={`${TB_BTN} font-bold`} title="Tučné">B</button>
        <button onMouseDown={e=>{e.preventDefault();exec('italic')}} className={`${TB_BTN} italic`}    title="Kurzíva">I</button>
        <button onMouseDown={e=>{e.preventDefault();exec('underline')}} className={`${TB_BTN} underline`} title="Podčiarknuté">U</button>
        {SEP}

        {/* Lists */}
        <button onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList')}} className={TB_BTN} title="Zoznam">• UL</button>
        <button onMouseDown={e=>{e.preventDefault();exec('insertOrderedList')}}   className={TB_BTN} title="Číslov. zoznam">1. OL</button>
        <button onMouseDown={e=>{e.preventDefault();exec('insertHorizontalRule')}} className={TB_BTN} title="Oddeľovač">—</button>
        {SEP}

        {/* Link */}
        <button
          onMouseDown={e => { e.preventDefault(); saveSelection(); setLinkOpen(v => !v); setEmbedOpen(false) }}
          className={`${TB_BTN} ${linkOpen ? TB_ACTIVE : ''}`} title="Vložiť odkaz"
        >🔗 Link</button>
        {SEP}

        {/* Image upload */}
        <button
          onMouseDown={e => { e.preventDefault(); saveSelection(); fileRef.current?.click() }}
          disabled={uploading}
          className={`${TB_BTN} ${uploading ? 'opacity-50' : ''}`} title="Vložiť obrázok"
        >
          {uploading ? '⏳' : '🖼'} Foto
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        {/* HTML / iframe embed */}
        <button
          onMouseDown={e => { e.preventDefault(); saveSelection(); setEmbedOpen(v => !v); setLinkOpen(false) }}
          className={`${TB_BTN} ${embedOpen ? TB_ACTIVE : ''}`} title="Vložiť HTML / iframe"
        >{'</>'} Embed</button>

      </div>

      {/* ── Link panel ──────────────────────────────────────────────────── */}
      {linkOpen && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-xs text-gray-500 shrink-0">URL:</span>
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setLinkOpen(false) }}
            placeholder="https://..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600"
          />
          <button onClick={insertLink} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">Vložiť</button>
          <button onClick={() => setLinkOpen(false)} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
        </div>
      )}

      {/* ── Embed panel ─────────────────────────────────────────────────── */}
      {embedOpen && (
        <div className="px-3 py-3 bg-gray-800 border-b border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Vložiť HTML / iframe kód</span>
            <button onClick={() => setEmbedOpen(false)} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
          </div>
          <textarea
            autoFocus
            value={embedCode}
            onChange={e => setEmbedCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setEmbedOpen(false) }}
            placeholder={'<iframe src="..." width="100%" height="400" frameborder="0"></iframe>'}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-green-400 font-mono outline-none focus:border-blue-600 transition-colors resize-none placeholder-gray-700"
          />
          <div className="flex gap-2">
            <button onClick={insertEmbed} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors">Vložiť</button>
            <span className="text-xs text-gray-600 self-center">Podporuje iframe, YouTube, mapy, formuláre…</span>
          </div>
        </div>
      )}

      {/* ── Editable area ───────────────────────────────────────────────── */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold') }
          if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic') }
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); saveSelection(); setLinkOpen(true) }
        }}
        className="min-h-72 px-4 py-4 text-sm text-gray-200 outline-none prose prose-invert prose-sm max-w-none
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
          [&_.embed-block]:bg-gray-800 [&_.embed-block]:rounded-lg [&_.embed-block]:p-2
          [&_img]:max-w-full [&_img]:rounded-lg [&_a]:text-blue-400 [&_a]:underline"
      />

      <div className="px-4 py-1.5 border-t border-gray-800 text-xs text-gray-700">
        Drag &amp; drop obrázky priamo do textu · Cmd+B tučné · Cmd+I kurzíva · Cmd+K odkaz
      </div>
    </div>
  )
}
