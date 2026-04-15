'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Globe, FileText, Home } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  is_published: boolean
  is_homepage: boolean
  created_at: string
}

export default function StrankyPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/pages')
    const data = await res.json() as Page[]
    setPages(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Naozaj zmazať stránku „${title}"?`)) return
    setDeleting(id)
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stránky</h1>
          <p className="text-sm text-gray-500 mt-1">Správa stránok vášho webu</p>
        </div>
        <Link
          href="/admin/stranky/nova"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          Nová stránka
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Načítavam...</div>
        ) : pages.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Žiadne stránky</p>
            <p className="text-gray-400 text-sm mt-1">Vytvorte prvú stránku svojho webu</p>
            <Link
              href="/admin/stranky/nova"
              className="inline-flex items-center gap-2 mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Plus size={15} />
              Nová stránka
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Názov</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vytvorená</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {page.is_homepage && <Home size={14} className="text-gray-400 shrink-0" />}
                      <span className="text-sm font-medium text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono">/{page.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    {page.is_published ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        <Globe size={11} />
                        Publikovaná
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <FileText size={11} />
                        Koncept
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.created_at).toLocaleDateString('sk-SK')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/stranky/${page.id}/upravit`}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={deleting === page.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
