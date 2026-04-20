import { redirect } from 'next/navigation'
import { getMyTenantId } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import Link from 'next/link'
import PageHeader from '@/components/public/PageHeader'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function PreviewAktualityPage() {
  const tenantId = await getMyTenantId()
  if (!tenantId) redirect('/login')

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('aktuality')
    .select('id, title, slug, perex, published_at, author, cover_url')
    .eq('tenant_id', tenantId)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (data ?? []) as Aktualita[]

  return (
    <>
      <PageHeader
        title="Aktuality"
        breadcrumbs={[{ label: 'Domov', href: '/preview' }, { label: 'Aktuality' }]}
      />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <p style={{ color: 'var(--c-text)' }} className="opacity-50">Žiadne aktuality.</p>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Link
                key={item.id}
                href={`/preview/aktuality/${item.slug}`}
                className="block bg-white border border-black/6 p-6 transition-all group hover:border-black/10"
                style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--c-text)', opacity: 0.45 }}>
                  <span>{formatDate(item.published_at ?? '')}</span>
                  {item.author && <><span>·</span><span>{item.author}</span></>}
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--c-text)', fontFamily: 'var(--font-heading)' }}>
                  {item.title}
                </h2>
                {item.perex && (
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--c-text)', opacity: 0.55 }}>{item.perex}</p>
                )}
                <span className="inline-block mt-3 text-xs font-semibold" style={{ color: 'var(--c-primary)' }}>
                  Čítať viac →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
