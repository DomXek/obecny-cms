import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_STYLE, SiteStyle } from '@/lib/siteStyle'

export async function loadSiteStyle(tenantId?: string | null): Promise<SiteStyle> {
  const supabase = createServiceClient()
  let query = supabase.from('site_settings').select('value').eq('key', 'style')
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data } = await query.single()
  return { ...DEFAULT_STYLE, ...(data?.value ?? {}) }
}
