import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { DEFAULT_STYLE, SiteStyle } from '@/lib/siteStyle'
import { NextResponse } from 'next/server'

export async function GET() {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'style')
    .eq('tenant_id', tenantId)
    .single()

  return NextResponse.json({ ...DEFAULT_STYLE, ...(data?.value ?? {}) } as SiteStyle)
}

export async function PATCH(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as Partial<SiteStyle>
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'style')
    .eq('tenant_id', tenantId)
    .single()

  const merged = { ...DEFAULT_STYLE, ...(existing?.value ?? {}), ...body }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'style', tenant_id: tenantId, value: merged }, { onConflict: 'key,tenant_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(merged)
}
