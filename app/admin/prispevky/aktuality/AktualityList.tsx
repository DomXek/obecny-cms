'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Newspaper, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Aktualita } from '@/lib/types'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AktualityList({ initialItems }: { initialItems: Aktualita[] }) {
  const [items, setItems] = useState<Aktualita[]>(initialItems)
  const router = useRouter()

  async function deleteItem(id: string) {
    if (!confirm('Naozaj vymazať tento článok?')) return
    await fetch(`/api/aktuality/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function togglePublish(item: Aktualita) {
    const res = await fetch(`/api/aktuality/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_published: !item.is_published,
        published_at: !item.is_published ? new Date().toISOString() : item.published_at,
      }),
    })
    const updated = await res.json()
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Aktuality</span>
          <span className="text-xs text-gray-600 ml-1">({items.length})</span>
        </div>
        <button
          onClick={() => router.push('/admin/prispevky/aktuality/nova')}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={14} />
          Nová aktualita
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Newspaper size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Žiadne aktuality</p>
            <p className="text-gray-600 text-xs mb-4">Vytvorte prvý článok kliknutím na tlačidlo vyššie.</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nadpis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Autor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dátum</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stav</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white truncate max-w-xs">{item.title}</div>
                      {item.perex && (
                        <div className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{item.perex}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{item.author ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(item.published_at ?? item.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.is_published
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {item.is_published ? 'Publikované' : 'Koncept'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => togglePublish(item)}
                          title={item.is_published ? 'Skryť' : 'Publikovať'}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => router.push(`/admin/prispevky/aktuality/${item.id}`)}
                          title="Upraviť"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          title="Vymazať"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
