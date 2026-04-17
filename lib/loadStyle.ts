import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_STYLE, SiteStyle } from '@/lib/siteStyle'

export async function loadSiteStyle(): Promise<SiteStyle> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings').select('value').eq('key', 'style').single()
  return { ...DEFAULT_STYLE, ...(data?.value ?? {}) }
}
