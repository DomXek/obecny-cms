import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? 'domov'
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? 'domov'
  const body = await request.json() as { layout: unknown }
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pages')
    .upsert(
      { slug, tenant_id: tenantId, layout: body.layout, title: slug === 'domov' ? 'Domov' : slug },
      { onConflict: 'slug,tenant_id' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
