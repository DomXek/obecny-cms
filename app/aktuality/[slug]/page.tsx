import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AktualitaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('aktuality')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) notFound()
  const item = data as Aktualita

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/aktuality" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block">
        ← Späť na aktuality
      </Link>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
        <span>{formatDate(item.published_at ?? item.created_at)}</span>
        {item.author && <><span>·</span><span>{item.author}</span></>}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
      {item.perex && (
        <p className="text-lg text-gray-500 mb-8 border-l-4 border-blue-200 pl-4">{item.perex}</p>
      )}
      {item.content && (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      )}
    </main>
  )
}
