import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: Request) {
  const { name, slug, email, password } = await req.json() as {
    name: string
    slug: string
    email: string
    password: string
  }

  if (!name || !slug || !email || !password) {
    return NextResponse.json({ error: 'Všetky polia sú povinné' }, { status: 400 })
  }

  const safeSlug = toSlug(slug)
  if (!safeSlug) {
    return NextResponse.json({ error: 'Neplatný slug stránky' }, { status: 400 })
  }

  const service = createServiceClient()

  // Check slug availability
  const { data: existing } = await service
    .from('tenants')
    .select('id')
    .eq('slug', safeSlug)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Tento slug je už obsadený' }, { status: 409 })
  }

  // Create auth user + sign in
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? 'Registrácia zlyhala' }, { status: 400 })
  }

  // Create tenant
  const { data: tenant, error: tenantError } = await service
    .from('tenants')
    .insert({ slug: safeSlug, name })
    .select()
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Nepodarilo sa vytvoriť stránku' }, { status: 500 })
  }

  // Link user to tenant via profiles (profiles.id = auth.users.id)
  // Upsert handles case where trigger already created a profile row
  const { error: profileError } = await service
    .from('profiles')
    .upsert({ id: authData.user.id, tenant_id: tenant.id, role: 'admin' }, { onConflict: 'id' })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug: safeSlug })
}
