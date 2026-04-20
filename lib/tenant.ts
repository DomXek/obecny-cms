import { createClient } from './supabase/server'

// profiles.id = auth.users.id (standard Supabase pattern)
export async function getMyTenantId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  return data?.tenant_id ?? null
}
