import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'

export default async function NoticeDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tenant?: string }
}) {
  const supabase = await createServiceClient()
  const { data: notice } = await supabase
    .from('official_notices')
    .select('*')
    .eq('id', params.id)
    .in('status', ['published', 'archived'])
    .single()

  if (!notice) notFound()

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/uradna-tabula?tenant=${searchParams.tenant ?? ''}`}
        className="text-sm text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Úradná tabuľa
      </Link>

      {notice.category && (
        <span className="inline-block text-xs font-medium uppercase tracking-wide text-blue-600 mb-2">
          {notice.category}
        </span>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{notice.title}</h1>

      {notice.reference_number && (
        <p className="text-sm text-gray-400 mb-6">Číslo jednania: {notice.reference_number}</p>
      )}

      <div className="bg-gray-50 rounded-lg p-4 mb-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Dátum vyvesenia:</span>
          <p className="font-semibold text-gray-900">
            {notice.published_at
              ? format(new Date(notice.published_at), 'd. MMMM yyyy', { locale: sk })
              : '—'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Dátum zvesenia:</span>
          <p className="font-semibold text-gray-900">
            {notice.removed_at
              ? format(new Date(notice.removed_at), 'd. MMMM yyyy', { locale: sk })
              : notice.expires_at
              ? format(new Date(notice.expires_at), 'd. MMMM yyyy', { locale: sk })
              : '—'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Stav:</span>
          <p className="font-semibold">
            {notice.status === 'published' ? (
              <span className="text-green-600">Vyvesené</span>
            ) : (
              <span className="text-gray-500">Archivované</span>
            )}
          </p>
        </div>
      </div>

      {notice.content && (
        <div className="prose prose-gray max-w-none mb-8">
          <p className="whitespace-pre-wrap text-gray-700">{notice.content}</p>
        </div>
      )}

      {notice.document_url && (
        <a
          href={notice.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Stiahnuť dokument (PDF)
        </a>
      )}
    </main>
  )
}
