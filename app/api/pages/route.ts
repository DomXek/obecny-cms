import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function GET() {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, is_published, updated_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
