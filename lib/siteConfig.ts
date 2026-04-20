import { createServiceClient } from './supabase/service'
import { createClient } from './supabase/server'
import type { SiteType } from './plugins'

export async function getSiteType(): Promise<SiteType | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_type')
    .single()
  return (data?.value as { type: SiteType } | null)?.type ?? null
}

export async function getEnabledPlugins(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'enabled_plugins')
    .single()
  return (data?.value as { ids: string[] } | null)?.ids ?? []
}

export async function setSiteType(type: SiteType, enabledPlugins: string[]): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('site_settings').upsert(
    { key: 'site_type', value: { type } },
    { onConflict: 'key' },
  )
  await supabase.from('site_settings').upsert(
    { key: 'enabled_plugins', value: { ids: enabledPlugins } },
    { onConflict: 'key' },
  )
}

export async function setEnabledPlugins(ids: string[]): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('site_settings').upsert(
    { key: 'enabled_plugins', value: { ids } },
    { onConflict: 'key' },
  )
}
