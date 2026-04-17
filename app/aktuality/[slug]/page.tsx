import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/public/PageHeader'

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
    <>
      <PageHeader
        title={item.title}
        breadcrumbs={[
          { label: 'Domov', href: '/' },
          { label: 'Aktuality', href: '/aktuality' },
          { label: item.title },
        ]}
      />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm mb-6" style={{ color: 'var(--c-text)', opacity: 0.5 }}>
          <span>{formatDate(item.published_at ?? item.created_at)}</span>
          {item.author && <><span>·</span><span>{item.author}</span></>}
        </div>

        {/* Perex */}
        {item.perex && (
          <p className="text-lg mb-8 pl-4 border-l-4 leading-relaxed"
            style={{ color: 'var(--c-text)', borderColor: 'var(--c-primary)', opacity: 0.7, fontFamily: 'var(--font-body)' }}>
            {item.perex}
          </p>
        )}

        {/* Content */}
        {item.content && (
          <div
            className="prose prose-gray max-w-none"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--c-text)' }}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-black/6">
          <Link
            href="/aktuality"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--c-primary)' }}
          >
            ← Späť na aktuality
          </Link>
        </div>
      </main>
    </>
  )
}
