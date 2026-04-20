import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { TEMPLATES } from '@/lib/templates'
import TemplatesGallery from './TemplatesGallery'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const { data: page } = await supabase
    .from('pages')
    .select('id, layout')
    .eq('slug', 'domov')
    .eq('tenant_id', tenantId)
    .single()

  return <TemplatesGallery templates={TEMPLATES} currentLayout={page?.layout ?? null} />
}
