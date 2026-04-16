import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import Editor from '@/components/editor/Editor'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServiceClient()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'domov')
    .single()

  return (
    <Editor
      pageId={page?.id ?? ''}
      pageSlug="domov"
      pageTitle={page?.title ?? 'Domov'}
      initialLayout={(page?.layout as PageLayout) ?? null}
    />
  )
}
