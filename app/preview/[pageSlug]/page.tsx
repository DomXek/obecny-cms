import { redirect, notFound } from 'next/navigation'
import { getMyTenantId } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import HeroRenderer from '@/components/public/HeroRenderer'
import GridRenderer from '@/components/public/GridRenderer'

export const dynamic = 'force-dynamic'

export default async function PreviewPage({ params }: { params: Promise<{ pageSlug: string }> }) {
  const { pageSlug } = await params
  const tenantId = await getMyTenantId()
  if (!tenantId) redirect('/login')

  const supabase = createServiceClient()
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', pageSlug)
    .eq('tenant_id', tenantId)
    .single()

  if (!page) notFound()

  const layout = page.layout as PageLayout

  return (
    <>
      <HeroRenderer hero={layout.hero} />
      <GridRenderer rows={(layout as any).rows ?? []} tenantId={tenantId} basePath="/preview" />
    </>
  )
}
