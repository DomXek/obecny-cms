import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tenantSlug = req.headers.get('x-tenant-slug') ?? searchParams.get('tenant') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 10)))
  const category = searchParams.get('category')

  if (!tenantSlug) {
    return NextResponse.json({ error: 'Chýba tenant' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant nenájdený' }, { status: 404 })
  }

  let query = supabase
    .from('official_notices')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenant.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category) query = query.eq('category', category)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}
