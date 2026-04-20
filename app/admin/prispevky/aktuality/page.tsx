import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { Aktualita } from '@/lib/types'
import AktualityList from './AktualityList'

export const dynamic = 'force-dynamic'

export default async function AktualityPage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('aktuality')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  return <AktualityList initialItems={(data ?? []) as Aktualita[]} />
}
