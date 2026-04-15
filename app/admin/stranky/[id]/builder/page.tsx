import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import Builder from '@/components/builder/Builder'
import { PageLayout } from '@/components/builder/types'

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pages')
    .select('id, title, slug, layout')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  return (
    <Builder
      pageId={data.id}
      pageSlug={data.slug}
      pageTitle={data.title}
      initialLayout={(data.layout as PageLayout) ?? null}
    />
  )
}
