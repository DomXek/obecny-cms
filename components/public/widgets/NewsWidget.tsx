import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function NewsWidget() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('aktuality')
    .select('id, title, slug, perex, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5)

  const items = (data ?? []) as Aktualita[]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Aktuality</h2>
        <Link href="/aktuality" className="text-xs text-blue-600 hover:underline">Všetky →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">Žiadne aktuality.</p>
      ) : (
        <ul className="space-y-3 flex-1 overflow-auto">
          {items.map(item => (
            <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <Link href={`/aktuality/${item.slug}`} className="group">
                <p className="text-xs text-gray-400 mb-0.5">{formatDate(item.published_at ?? '')}</p>
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors leading-snug">
                  {item.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
