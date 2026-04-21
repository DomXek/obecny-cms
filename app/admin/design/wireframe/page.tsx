import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { getEnabledPlugins } from '@/lib/siteConfig'
import { PageLayout } from '@/lib/types'
import Editor from '@/components/editor/Editor'

export const dynamic = 'force-dynamic'

export default async function WireframePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug: slugParam } = await searchParams
  const slug = slugParam ?? 'domov'

  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const [{ data: page }, enabledPlugins] = await Promise.all([
    supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('tenant_id', tenantId)
      .single(),
    getEnabledPlugins(tenantId!),
  ])

  return (
    <Editor
      pageId={page?.id ?? ''}
      pageSlug={slug}
      pageTitle={page?.title ?? slug}
      initialLayout={(page?.layout as PageLayout) ?? null}
      initialPublished={page?.is_published ?? true}
      enabledPlugins={enabledPlugins}
    />
  )
}
