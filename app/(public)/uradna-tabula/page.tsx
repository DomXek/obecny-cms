import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { OfficialNotice } from '@/lib/supabase/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'

async function getNotices(tenantId: string): Promise<OfficialNotice[]> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('official_notices')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return data ?? []
}

async function getTenantId(slug: string): Promise<string | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase.from('tenants').select('id, name').eq('slug', slug).single()
  return data?.id ?? null
}

export default async function UradnaTabulaPage({
  searchParams,
}: {
  searchParams: { tenant?: string }
}) {
  const headersList = await headers()
  const tenantSlug =
    headersList.get('x-tenant-slug') ?? searchParams.tenant ?? 'demo'

  const tenantId = await getTenantId(tenantSlug)
  if (!tenantId) {
    return <div className="p-8 text-red-600">Obec nenájdená.</div>
  }

  const notices = await getNotices(tenantId)

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Úradná tabuľa</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Zverejnené dokumenty podľa zákona č. 211/2000 Z.z.
      </p>

      {notices.length === 0 ? (
        <p className="text-gray-500">Momentálne nie sú zverejnené žiadne oznámenia.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/uradna-tabula/${notice.id}?tenant=${tenantSlug}`}
              className="block border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {notice.category && (
                    <span className="inline-block text-xs font-medium uppercase tracking-wide text-blue-600 mb-1">
                      {notice.category}
                    </span>
                  )}
                  <h2 className="font-semibold text-gray-900">{notice.title}</h2>
                  {notice.reference_number && (
                    <p className="text-xs text-gray-400 mt-0.5">č. {notice.reference_number}</p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500 shrink-0">
                  <div>
                    Vyvesené:{' '}
                    <span className="font-medium text-gray-700">
                      {notice.published_at
                        ? format(new Date(notice.published_at), 'd. M. yyyy', { locale: sk })
                        : '—'}
                    </span>
                  </div>
                  <div>
                    Zvesenie:{' '}
                    <span className="font-medium text-gray-700">
                      {notice.expires_at
                        ? format(new Date(notice.expires_at), 'd. M. yyyy', { locale: sk })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <Link
          href={`/uradna-tabula/archiv?tenant=${tenantSlug}`}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Archív úradnej tabule →
        </Link>
      </div>
    </main>
  )
}
