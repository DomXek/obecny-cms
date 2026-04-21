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

export async function POST(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { title: string; slug: string }
  const { title, slug } = body

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Názov a slug sú povinné' }, { status: 400 })
  }

  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: title.trim(),
      slug: cleanSlug,
      tenant_id: tenantId,
      layout: {},
      is_published: false,
    })
    .select('id, slug, title, is_published, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Stránka s týmto slugom už existuje' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Chýba id' }, { status: 400 })

  const supabase = createServiceClient()

  // Prevent deleting the homepage
  const { data: page } = await supabase
    .from('pages')
    .select('slug')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (page?.slug === 'domov') {
    return NextResponse.json({ error: 'Domovskú stránku nie je možné zmazať' }, { status: 403 })
  }

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Chýba id' }, { status: 400 })

  const body = await request.json() as { is_published?: boolean; title?: string }
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pages')
    .update(body)
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
