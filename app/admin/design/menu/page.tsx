import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { NavConfig, PageLayout } from '@/lib/types'
import MenuEditor from './MenuEditor'

export const dynamic = 'force-dynamic'

const DEFAULT_NAV: NavConfig = {
  style: 'simple',
  position: 'center',
  items: [{ id: 'domov', label: 'Domov', slug: 'domov' }],
}

export default async function MenuPage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const { data: page } = await supabase
    .from('pages')
    .select('layout')
    .eq('slug', 'domov')
    .eq('tenant_id', tenantId)
    .single()

  const layout = page?.layout as PageLayout | undefined
  const nav: NavConfig = layout?.nav ?? DEFAULT_NAV

  return <MenuEditor initialNav={nav} />
}
