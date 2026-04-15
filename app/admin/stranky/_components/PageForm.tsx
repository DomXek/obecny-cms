'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, FileText } from 'lucide-react'
import Link from 'next/link'

interface PageFormValues {
  title: string
  slug: string
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

export default function PageForm({ initial, mode }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<PageFormValues>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    is_published: initial?.is_published ?? false,
    is_homepage: initial?.is_homepage ?? false,
  })
  const [slugManual, setSlugManual] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(title: string) {
    setValues(v => ({
      ...v,
      title,
      slug: slugManual ? v.slug : slugify(title),
    }))
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
      body: JSON.stringify(values),
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
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {/* Title */}
          <div className="p-6">
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

          {/* Slug */}
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 shrink-0">yourdomain.sk/</span>
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  setValues(v => ({ ...v, slug: e.target.value }))
                }}
                required
                placeholder="o-obci"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="p-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">Stav</label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={values.is_published}
                  onChange={(e) => setValues(v => ({ ...v, is_published: e.target.checked }))}
                  className="sr-only peer"
                />
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
                <input
                  type="checkbox"
                  checked={values.is_homepage}
                  onChange={(e) => setValues(v => ({ ...v, is_homepage: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-gray-700">Úvodná stránka (homepage)</span>
            </label>
          </div>
        </div>

        {/* SEO card */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-700">SEO</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta title</label>
              <input
                type="text"
                value={values.meta_title}
                onChange={(e) => setValues(v => ({ ...v, meta_title: e.target.value }))}
                placeholder={values.title || 'Meta title'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta description</label>
              <textarea
                value={values.meta_description}
                onChange={(e) => setValues(v => ({ ...v, meta_description: e.target.value }))}
                rows={3}
                placeholder="Krátky popis stránky pre vyhľadávače..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/stranky"
            className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Zrušiť
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Ukladám...' : mode === 'create' ? 'Vytvoriť stránku' : 'Uložiť zmeny'}
          </button>
        </div>
      </form>
    </div>
  )
}
