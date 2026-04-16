'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import { Check } from 'lucide-react'

export default function SablonyPage() {
  const router = useRouter()
  const [applying, setApplying] = useState<string | null>(null)
  const [modal, setModal] = useState<string | null>(null) // template id
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')

  function slugify(text: string) {
    return text.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
  }

  async function applyTemplate(templateId: string) {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (!tpl || !pageTitle.trim() || !pageSlug.trim()) return

    setApplying(templateId)

    // Vytvor novú stránku
    const res = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: pageTitle.trim(),
        slug: pageSlug.trim(),
        is_published: false,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json() as { error: string }
      alert(error)
      setApplying(null)
      return
    }

    const page = await res.json() as { id: string }

    // Aplikuj layout šablóny
    await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: tpl.layout }),
    })

    setApplying(null)
    setModal(null)
    router.push(`/admin/stranky/${page.id}/builder`)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Šablóny</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hotové rozloženia stránok — vyber šablónu, pomenuj stránku a hneď edituj v builderi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TEMPLATES.map(tpl => (
          <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Preview */}
            <div className="bg-gradient-to-br from-[#154a8a] to-[#0d3566] h-36 flex flex-col items-center justify-center gap-2 px-6">
              <div className="text-5xl">{tpl.preview}</div>
              {/* Mini nav preview */}
              <div className="flex gap-3 mt-1">
                {tpl.layout.nav.items?.slice(0, 4).map(it => (
                  <span key={it.slug} className="text-white/60 text-xs">{it.label}</span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{tpl.name}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{tpl.description}</p>

              {/* Sections preview */}
              <div className="space-y-1.5 mb-5">
                {tpl.layout.sections.map((sec, i) => {
                  const cells = 'cells' in sec ? sec.cells.filter(c => c.row === 0) : []
                  const cols = 'cols' in sec ? sec.cols : 1
                  return (
                    <div key={i} className="flex gap-1">
                      {cells.map((cell, j) => (
                        <div key={j}
                          className="h-6 rounded text-xs flex items-center justify-center font-medium bg-gray-100 text-gray-500"
                          style={{ width: `${(cell.colSpan / cols) * 100}%` }}>
                          {cell.widget === 'text' ? '¶' : cell.widget === 'notices' ? '📋' :
                           cell.widget === 'news' ? '📰' : cell.widget === 'events' ? '📅' :
                           cell.widget === 'gallery' ? '🖼' : cell.widget === 'contact' ? '✉️' :
                           cell.widget === 'documents' ? '📄' : '□'}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => { setModal(tpl.id); setPageTitle(tpl.name); setPageSlug(slugify(tpl.name)) }}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Použiť šablónu
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (() => {
        const tpl = TEMPLATES.find(t => t.id === modal)!
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
              <div className="text-3xl mb-3">{tpl.preview}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{tpl.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Pomenuj novú stránku — hneď ťa prehodíme do builderu.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Názov stránky</label>
                  <input
                    value={pageTitle}
                    onChange={e => { setPageTitle(e.target.value); setPageSlug(slugify(e.target.value)) }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="napr. Domov"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">URL slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">yourdomain.sk/</span>
                    <input
                      value={pageSlug}
                      onChange={e => setPageSlug(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  onClick={() => applyTemplate(modal)}
                  disabled={!!applying || !pageTitle.trim() || !pageSlug.trim()}
                  className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {applying ? 'Vytváram...' : <><Check size={15} /> Vytvoriť a otvoriť</>}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
