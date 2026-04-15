'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OfficialNotice } from '@/lib/supabase/types'
import { format, formatDistanceToNow } from 'date-fns'
import { sk } from 'date-fns/locale'

function StatusBadge({ status }: { status: OfficialNotice['status'] }) {
  const map = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-amber-100 text-amber-700',
  }
  const labels = { draft: 'Draft', published: 'Zverejnené', archived: 'Archivované' }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function AdminUradnaTabulaPage() {
  const [notices, setNotices] = useState<OfficialNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const supabase = createClient()

  const loadNotices = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/admin/notices?limit=50')
    const json = await res.json() as { data: OfficialNotice[] }
    setNotices(json.data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

  async function handlePublish(id: string) {
    setActionLoading(id)
    setError('')
    const res = await fetch(`/api/admin/notices/${id}/publish`, { method: 'POST' })
    if (!res.ok) {
      const j = await res.json() as { error: string }
      setError(j.error)
    }
    await loadNotices()
    setActionLoading(null)
  }

  async function handleArchive(id: string) {
    setActionLoading(id)
    setError('')
    const res = await fetch(`/api/admin/notices/${id}/archive`, { method: 'POST' })
    if (!res.ok) {
      const j = await res.json() as { error: string; expires_at?: string }
      setError(j.error)
    }
    await loadNotices()
    setActionLoading(null)
  }

  function canArchiveNow(notice: OfficialNotice) {
    if (!notice.expires_at) return false
    return new Date(notice.expires_at) <= new Date()
  }

  if (loading) return <div className="p-8 text-gray-500">Načítavam...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Úradná tabuľa</h1>
        <a
          href="/admin/uradna-tabula/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nové oznámenie
        </a>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={notice.status} />
                {notice.category && (
                  <span className="text-xs text-gray-400">{notice.category}</span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 truncate">{notice.title}</h3>
              {notice.reference_number && (
                <p className="text-xs text-gray-400">č. {notice.reference_number}</p>
              )}
              {notice.status === 'published' && notice.expires_at && (
                <p className={`text-xs mt-1 ${canArchiveNow(notice) ? 'text-amber-600' : 'text-gray-500'}`}>
                  {canArchiveNow(notice)
                    ? 'Možno zvesiť'
                    : `Zvesenie: ${format(new Date(notice.expires_at), 'd. M. yyyy', { locale: sk })} (o ${formatDistanceToNow(new Date(notice.expires_at), { locale: sk })})`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notice.status === 'draft' && (
                <button
                  onClick={() => handlePublish(notice.id)}
                  disabled={actionLoading === notice.id}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Zverejniť
                </button>
              )}
              {notice.status === 'published' && (
                <button
                  onClick={() => canArchiveNow(notice) && handleArchive(notice.id)}
                  disabled={!canArchiveNow(notice) || actionLoading === notice.id}
                  title={
                    !canArchiveNow(notice)
                      ? `Možno zvesiť od ${notice.expires_at ? format(new Date(notice.expires_at), 'd. M. yyyy') : '?'}`
                      : 'Zvesiť oznámenie'
                  }
                  className="bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Zvesiť
                </button>
              )}
              {/* Žiadne tlačidlo Zmazať — zákon zakazuje */}
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <p className="text-gray-400 text-center py-12">Žiadne oznámenia</p>
        )}
      </div>
    </div>
  )
}
