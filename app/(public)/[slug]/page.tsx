import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import GovHeader from '@/components/template/GovHeader'
import GovFooter from '@/components/template/GovFooter'
import { PageLayout, WIDGETS } from '@/components/builder/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

function renderLayout(layout: PageLayout) {
  return (
    <>
      {/* Hero */}
      <div
        className="bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center gap-3 px-8"
        style={{ minHeight: layout.hero.height }}
      >
        {layout.hero.title && (
          <h1 className="text-4xl font-bold text-white text-center">{layout.hero.title}</h1>
        )}
        {layout.hero.subtitle && (
          <p className="text-white/70 text-lg text-center">{layout.hero.subtitle}</p>
        )}
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
        {layout.sections.map(section => (
          <div key={section.id} className="flex gap-6">
            {section.columns.map((col, i) => {
              const w = WIDGETS[col.widget]
              return (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ width: `${col.width}%` }}
                >
                  {col.widget === 'text' ? (
                    <div
                      className="prose prose-gray prose-lg max-w-none p-2"
                      dangerouslySetInnerHTML={{ __html: col.content?.html ?? '' }}
                    />
                  ) : col.widget === 'empty' ? null : (
                    <div className={`p-6 rounded-xl ${w.bg} ${w.text} text-center font-semibold`}>
                      {w.icon} {w.label}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const supabase = createServiceClient()

  let query = supabase.from('pages').select('*').eq('slug', slug)
  if (!isPreview) query = query.eq('is_published', true)

  const { data: page, error } = await query.single()

  if (error || !page) notFound()

  const { data: navPages } = await supabase
    .from('pages')
    .select('title, slug')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, contact_email, contact_phone, address')
    .limit(1)
    .single()

  const municipalityName = tenant?.name ?? 'Obec'
  const layout = page.layout as PageLayout | null

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <GovHeader
        municipalityName={municipalityName}
        navConfig={layout?.nav ?? null}
        allPages={(navPages ?? []).map(p => ({ title: p.title, slug: p.slug }))}
        currentSlug={slug}
      />

      <div className="flex-1 flex flex-col">
        {layout ? (
          renderLayout(layout)
        ) : (
          <>
            <div className="bg-white border-b border-gray-100">
              <div className="max-w-6xl mx-auto px-6 py-2">
                <nav className="text-xs text-gray-400 flex items-center gap-2">
                  <a href="/" className="hover:text-[#154a8a]">Domov</a>
                  <span>/</span>
                  <span className="text-gray-700">{page.title}</span>
                </nav>
              </div>
            </div>
            <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
                {page.content ? (
                  <div className="prose prose-gray prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                  <p className="text-gray-400 italic">Táto stránka zatiaľ nemá obsah.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <GovFooter
        municipalityName={municipalityName}
        contactEmail={tenant?.contact_email}
        contactPhone={tenant?.contact_phone}
        address={tenant?.address}
      />
    </div>
  )
}
