'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, FileText, Eye, Bold, Italic, List, Heading2, Heading3, Link2 } from 'lucide-react'
import Link from 'next/link'

interface PageFormValues {
  title: string
  slug: string
  content: string
  meta_title: string
  meta_description: string
  is_published: boolean
  is_homepage: boolean
}

interface Props {
  initial?: PageFormValues & { id?: string }
  mode: 'create' | 'edit'
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^(?!<[hul])(.*\S.*)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '')
}

export default function PageForm({ initial, mode }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<PageFormValues>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    content: initial?.content ?? '',
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    is_published: initial?.is_published ?? false,
    is_homepage: initial?.is_homepage ?? false,
  })
  const [slugManual, setSlugManual] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  function handleTitleChange(title: string) {
    setValues(v => ({
      ...v,
      title,
      slug: slugManual ? v.slug : slugify(title),
    }))
  }

  function insertFormat(before: string, after = '') {
    const ta = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = values.content.substring(start, end)
    const newContent =
      values.content.substring(0, start) +
      before + (selected || 'text') + after +
      values.content.substring(end)
    setValues(v => ({ ...v, content: newContent }))
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = mode === 'edit' ? `/api/admin/pages/${initial?.id}` : '/api/admin/pages'
    const method = mode === 'edit' ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, content: markdownToHtml(values.content) }),
    })

    const data = await res.json() as { error?: string }

    if (!res.ok) {
      setError(data.error ?? 'Nastala chyba')
      setSaving(false)
      return
    }

    router.push('/admin/stranky')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/stranky" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {mode === 'create' ? 'Nová stránka' : 'Upraviť stránku'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'create' ? 'Vytvorte novú stránku webu' : 'Upravte obsah stránky'}
            </p>
          </div>
        </div>

        {mode === 'edit' && initial?.slug && (
          <a
            href={`/${initial.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={15} />
            Náhľad
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Názov stránky <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="napr. O obci"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Content editor */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Obsah stránky</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreview(false)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${!preview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Písať
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(true)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${preview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Náhľad
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              {!preview && (
                <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100">
                  <button type="button" onClick={() => insertFormat('## ', '')} title="Nadpis H2"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <Heading2 size={15} />
                  </button>
                  <button type="button" onClick={() => insertFormat('### ', '')} title="Nadpis H3"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <Heading3 size={15} />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button type="button" onClick={() => insertFormat('**', '**')} title="Tučné"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <Bold size={15} />
                  </button>
                  <button type="button" onClick={() => insertFormat('*', '*')} title="Kurzíva"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <Italic size={15} />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button type="button" onClick={() => insertFormat('- ', '')} title="Zoznam"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <List size={15} />
                  </button>
                  <button type="button" onClick={() => insertFormat('[', '](url)')} title="Odkaz"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                    <Link2 size={15} />
                  </button>
                </div>
              )}

              {preview ? (
                <div
                  className="p-6 prose prose-gray max-w-none min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(values.content) || '<p class="text-gray-400 italic">Prázdny obsah...</p>' }}
                />
              ) : (
                <textarea
                  id="content-editor"
                  value={values.content}
                  onChange={(e) => setValues(v => ({ ...v, content: e.target.value }))}
                  rows={16}
                  placeholder={`## Nadpis sekcie\n\nText stránky. Môžete použiť **tučné**, *kurzívu*, zoznamy...\n\n- Položka 1\n- Položka 2`}
                  className="w-full p-4 text-sm font-mono text-gray-800 focus:outline-none resize-y min-h-[300px] leading-relaxed"
                />
              )}
            </div>
          </div>

          {/* Right — settings */}
          <div className="space-y-4">
            {/* Slug */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL slug <span className="text-red-500">*</span>
              </label>
              <div className="text-xs text-gray-400 mb-1">yourdomain.sk/</div>
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  setValues(v => ({ ...v, slug: e.target.value }))
                }}
                required
                placeholder="o-obci"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <span className="block text-sm font-medium text-gray-700">Stav</span>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={values.is_published}
                    onChange={(e) => setValues(v => ({ ...v, is_published: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <div className="flex items-center gap-2">
                  {values.is_published
                    ? <><Globe size={14} className="text-green-600" /><span className="text-sm text-gray-700">Publikovaná</span></>
                    : <><FileText size={14} className="text-gray-400" /><span className="text-sm text-gray-500">Koncept</span></>
                  }
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={values.is_homepage}
                    onChange={(e) => setValues(v => ({ ...v, is_homepage: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-gray-700">Úvodná stránka</span>
              </label>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="px-5 py-3">
                <span className="text-sm font-semibold text-gray-700">SEO</span>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta title</label>
                  <input type="text" value={values.meta_title}
                    onChange={(e) => setValues(v => ({ ...v, meta_title: e.target.value }))}
                    placeholder={values.title || 'Meta title'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta description</label>
                  <textarea value={values.meta_description}
                    onChange={(e) => setValues(v => ({ ...v, meta_description: e.target.value }))}
                    rows={3}
                    placeholder="Popis pre vyhľadávače..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Link href="/admin/stranky" className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Zrušiť
          </Link>
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? 'Ukladám...' : mode === 'create' ? 'Vytvoriť stránku' : 'Uložiť zmeny'}
          </button>
        </div>
      </form>
    </div>
  )
}
