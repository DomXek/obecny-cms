import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import SpravyClient from './SpravyClient'

export const dynamic = 'force-dynamic'

export default async function SpravyPage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  return <SpravyClient initialMessages={data ?? []} />
}
