import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FOOTER, FooterConfig } from '@/lib/types'

export async function loadFooterConfig(tenantId?: string | null): Promise<FooterConfig> {
  const supabase = createServiceClient()
  let query = supabase.from('site_settings').select('value').eq('key', 'footer')
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data } = await query.single()
  return { ...DEFAULT_FOOTER, ...(data?.value ?? {}) }
}
