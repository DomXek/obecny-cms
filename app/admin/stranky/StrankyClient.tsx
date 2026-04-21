'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Pencil, Trash2, Globe, EyeOff, X, Check } from 'lucide-react'

interface Page {
  id: string
  slug: string
  title: string
  is_published: boolean
  updated_at: string
}

function slugify(str: string) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function StrankyClient({ initialPages }: { initialPages: Page[] }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugTouched) setSlug(slugify(val))
  }

  function openCreate() {
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setCreateError('')
    setShowCreate(true)
  }

  async function createPage() {
    if (!title.trim() || !slug.trim()) return
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), slug: slug.trim() }),
    })
    if (res.ok) {
      const newPage = await res.json()
      setPages(p => [...p, newPage])
      setShowCreate(false)
      router.push(`/admin/design/wireframe?slug=${newPage.slug}`)
    } else {
      const data = await res.json().catch(() => ({}))
      setCreateError(data.error ?? 'Chyba pri vytváraní')
      setCreating(false)
    }
  }

  async function deletePage(id: string, slug: string) {
    if (slug === 'domov') return
    if (!confirm('Naozaj chcete zmazať túto stránku?')) return
    setDeletingId(id)
    const res = await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPages(p => p.filter(x => x.id !== id))
    }
    setDeletingId(null)
  }

  async function togglePublish(page: Page) {
    const next = !page.is_published
    setPages(p => p.map(x => x.id === page.id ? { ...x, is_published: next } : x))
    await fetch(`/api/pages?id=${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: next }),
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Stránky</span>
          <span className="text-xs text-gray-600 ml-1">({pages.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Nová stránka
        </button>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-2">
          {pages.map(page => (
            <div
              key={page.id}
              className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={14} className="text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{page.title}</span>
                  {page.slug === 'domov' && (
                    <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded">
                      domovská
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">/{page.slug}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(page)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    page.is_published
                      ? 'border-green-800 text-green-400 bg-green-900/20 hover:bg-green-900/40'
                      : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {page.is_published ? <><Globe size={11} />Pub.</> : <><EyeOff size={11} />Skr.</>}
                </button>

                <a
                  href={`/admin/design/wireframe?slug=${page.slug}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                >
                  <Pencil size={11} />
                  Editovať
                </a>

                {page.slug !== 'domov' && (
                  <button
                    onClick={() => deletePage(page.id, page.slug)}
                    disabled={deletingId === page.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-gray-800 text-gray-600 hover:text-red-400 hover:border-red-900 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {pages.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Zatiaľ žiadne stránky</p>
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Nová stránka</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Názov stránky</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="napr. O nás"
                  autoFocus
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">URL slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
                    placeholder="o-nas"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-red-400 text-xs bg-red-900/20 rounded-lg px-3 py-2">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  onClick={createPage}
                  disabled={creating || !title.trim() || !slug.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {creating ? 'Vytváram…' : <><Check size={14} />Vytvoriť</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
