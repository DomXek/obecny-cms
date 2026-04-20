import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { getEnabledPlugins } from '@/lib/siteConfig'
import { PageLayout } from '@/lib/types'
import Editor from '@/components/editor/Editor'

export const dynamic = 'force-dynamic'

export default async function WireframePage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const [{ data: page }, enabledPlugins] = await Promise.all([
    supabase
      .from('pages')
      .select('*')
      .eq('slug', 'domov')
      .eq('tenant_id', tenantId)
      .single(),
    getEnabledPlugins(tenantId!),
  ])

  return (
    <Editor
      pageId={page?.id ?? ''}
      pageSlug="domov"
      pageTitle={page?.title ?? 'Domov'}
      initialLayout={(page?.layout as PageLayout) ?? null}
      enabledPlugins={enabledPlugins}
    />
  )
}
