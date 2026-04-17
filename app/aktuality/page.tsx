import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AktualityPublicPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('aktuality')
    .select('id, title, slug, perex, published_at, author, cover_url')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (data ?? []) as Aktualita[]

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Aktuality</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">Žiadne aktuality.</p>
      ) : (
        <div className="space-y-6">
          {items.map(item => (
            <Link
              key={item.id}
              href={`/aktuality/${item.slug}`}
              className="block bg-white border border-gray-200 p-6 hover:border-gray-300 transition-all group"
              style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span>{formatDate(item.published_at ?? item.created_at)}</span>
                {item.author && <><span>·</span><span>{item.author}</span></>}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {item.title}
              </h2>
              {item.perex && (
                <p className="text-gray-500 text-sm line-clamp-2">{item.perex}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
