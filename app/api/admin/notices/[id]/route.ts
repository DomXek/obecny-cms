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

// GET /api/admin/notices/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })

  const { data, error } = await ctx.service
    .from('official_notices')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', ctx.profile.tenant_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/admin/notices/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })

  const { data: notice } = await ctx.service
    .from('official_notices')
    .select('status, tenant_id')
    .eq('id', params.id)
    .eq('tenant_id', ctx.profile.tenant_id)
    .single()

  if (!notice) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })

  if (notice.status !== 'draft') {
    return NextResponse.json(
      { error: 'Upravovať je možné len draft oznámenia' },
      { status: 403 },
    )
  }

  const body = await req.json() as Record<string, unknown>
  const allowed = ['title', 'content', 'document_url', 'document_filename', 'category', 'reference_number']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await ctx.service
    .from('official_notices')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// DELETE /api/admin/notices/[id] — VŽDY 403 (zákon)
export async function DELETE() {
  return NextResponse.json(
    {
      error: 'Zmazanie úradného oznámenia je zakázané zo zákona (zákon č. 211/2000 Z.z.). ' +
             'Oznámenie je možné len archivovať po uplynutí 15-dňovej lehoty.',
    },
    { status: 403 },
  )
}
