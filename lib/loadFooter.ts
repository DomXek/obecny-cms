import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FOOTER, FooterConfig } from '@/lib/types'

export async function loadFooterConfig(): Promise<FooterConfig> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'footer')
    .single()
  return { ...DEFAULT_FOOTER, ...(data?.value ?? {}) }
}
