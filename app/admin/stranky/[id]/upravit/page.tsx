import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import PageForm from '../../_components/PageForm'

export default async function UpravitStranku({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('pages').select('*').eq('id', id).single()

  if (error || !data) notFound()

  return (
    <PageForm
      mode="edit"
      initial={{
        id: data.id,
        title: data.title,
        slug: data.slug,
        meta_title: data.meta_title ?? '',
        meta_description: data.meta_description ?? '',
        is_published: data.is_published,
        is_homepage: data.is_homepage,
      }}
    />
  )
}
