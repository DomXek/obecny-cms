import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { DEFAULT_FOOTER, FooterConfig } from '@/lib/types'
import { NextResponse } from 'next/server'

export async function GET() {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'footer')
    .eq('tenant_id', tenantId)
    .single()

  return NextResponse.json({ ...DEFAULT_FOOTER, ...(data?.value ?? {}) } as FooterConfig)
}

export async function PATCH(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as Partial<FooterConfig>
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'footer')
    .eq('tenant_id', tenantId)
    .single()

  const merged = { ...DEFAULT_FOOTER, ...(existing?.value ?? {}), ...body }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'footer', tenant_id: tenantId, value: merged }, { onConflict: 'key,tenant_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(merged)
}
