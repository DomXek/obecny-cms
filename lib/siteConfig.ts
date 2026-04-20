import { createServiceClient } from './supabase/service'
import type { SiteType } from './plugins'

export async function getSiteType(tenantId: string): Promise<SiteType | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_type')
    .eq('tenant_id', tenantId)
    .single()
  return (data?.value as { type: SiteType } | null)?.type ?? null
}

export async function getEnabledPlugins(tenantId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'enabled_plugins')
    .eq('tenant_id', tenantId)
    .single()
  return (data?.value as { ids: string[] } | null)?.ids ?? []
}

export async function setSiteType(type: SiteType, enabledPlugins: string[], tenantId: string): Promise<void> {
  const supabase = createServiceClient()
  await Promise.all([
    supabase.from('site_settings').upsert(
      { key: 'site_type', tenant_id: tenantId, value: { type } },
      { onConflict: 'key,tenant_id' },
    ),
    supabase.from('site_settings').upsert(
      { key: 'enabled_plugins', tenant_id: tenantId, value: { ids: enabledPlugins } },
      { onConflict: 'key,tenant_id' },
    ),
  ])
}

export async function setEnabledPlugins(ids: string[], tenantId: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('site_settings').upsert(
    { key: 'enabled_plugins', tenant_id: tenantId, value: { ids } },
    { onConflict: 'key,tenant_id' },
  )
}
