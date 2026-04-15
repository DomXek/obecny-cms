'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewNoticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    reference_number: '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const j = await res.json() as { error: string }
      setError(j.error)
      setLoading(false)
      return
    }

    router.push('/admin/uradna-tabula')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <a href="/admin/uradna-tabula" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Späť
      </a>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nové oznámenie</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Názov *</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategória</label>
          <input
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="napr. zámer, výberové konanie, VZN..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Číslo jednania</label>
          <input
            value={form.reference_number}
            onChange={(e) => set('reference_number', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Obsah</label>
          <textarea
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Ukladám...' : 'Uložiť ako draft'}
          </button>
          <a
            href="/admin/uradna-tabula"
            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Zrušiť
          </a>
        </div>
      </form>
    </div>
  )
}
