import { createClient } from './supabase/server'
import { createServiceClient } from './supabase/service'

export async function getMyTenantId(): Promise<string | null> {
  // Get user from auth session (cookie-based)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Query profiles via service role to bypass any RLS issues
  const service = createServiceClient()
  const { data } = await service
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  return data?.tenant_id ?? null
}
