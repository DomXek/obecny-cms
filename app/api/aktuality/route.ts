import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const publishedOnly = searchParams.get('published') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const supabase = createServiceClient()
  let query = supabase
    .from('aktuality')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (publishedOnly) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('aktuality')
    .insert({
      tenant_id: tenantId,
      title: body.title,
      slug: body.slug,
      perex: body.perex ?? null,
      content: body.content ?? null,
      cover_url: body.cover_url ?? null,
      author: body.author ?? null,
      published_at: body.published_at ?? null,
      is_published: body.is_published ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
