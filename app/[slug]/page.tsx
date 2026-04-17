import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import { notFound } from 'next/navigation'
import NavRenderer from '@/components/public/NavRenderer'
import HeroRenderer from '@/components/public/HeroRenderer'
import GridRenderer from '@/components/public/GridRenderer'

export const dynamic = 'force-dynamic'

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!page) notFound()

  const layout = page.layout as PageLayout

  return (
    <div className="min-h-screen bg-gray-50">
      <NavRenderer nav={layout.nav} siteName={page.title} />
      <HeroRenderer hero={layout.hero} />
      <GridRenderer blocks={layout.blocks ?? []} />
    </div>
  )
}
