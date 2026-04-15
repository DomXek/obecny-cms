import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const service = await createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  return { user, profile, service }
}

// GET /api/admin/notices
export async function GET(req: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const category = searchParams.get('category')

  let query = ctx.service
    .from('official_notices')
    .select('*', { count: 'exact' })
    .eq('tenant_id', ctx.profile.tenant_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category) query = query.eq('category', category)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}

// POST /api/admin/notices
export async function POST(req: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })

  const body = await req.json() as {
    title: string
    content?: string
    document_url?: string
    document_filename?: string
    category?: string
    reference_number?: string
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Názov je povinný' }, { status: 400 })
  }

  const { data, error } = await ctx.service
    .from('official_notices')
    .insert({
      tenant_id: ctx.profile.tenant_id,
      title: body.title.trim(),
      content: body.content ?? null,
      document_url: body.document_url ?? null,
      document_filename: body.document_filename ?? null,
      category: body.category ?? null,
      reference_number: body.reference_number ?? null,
      status: 'draft',
      created_by: ctx.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
