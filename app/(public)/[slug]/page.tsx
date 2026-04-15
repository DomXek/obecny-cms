import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import GovHeader from '@/components/template/GovHeader'
import GovFooter from '@/components/template/GovFooter'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServiceClient()

  // Load the page
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !page) notFound()

  // Load published pages for navigation
  const { data: navPages } = await supabase
    .from('pages')
    .select('title, slug')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  // Load tenant info (first tenant for now)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, contact_email, contact_phone, address')
    .limit(1)
    .single()

  const municipalityName = tenant?.name ?? 'Obec'

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <GovHeader
        municipalityName={municipalityName}
        nav={navPages ?? []}
        currentSlug={slug}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <nav className="text-xs text-gray-400 flex items-center gap-2">
            <a href="/" className="hover:text-[#154a8a]">Domov</a>
            <span>/</span>
            <span className="text-gray-700">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>

          {page.content ? (
            <div
              className="prose prose-gray prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-gray-400 italic">Táto stránka zatiaľ nemá obsah.</p>
          )}
        </div>
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
