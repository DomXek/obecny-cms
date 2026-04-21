import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { tenantId, name, email, phone, message } = body as {
    tenantId?: string; name?: string; email?: string; phone?: string; message?: string
  }

  if (!tenantId || !name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Chýbajú povinné polia' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('contact_messages').insert({
    tenant_id: tenantId,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() ?? null,
    message: message.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Chýba id' }, { status: 400 })

  const body = await request.json() as { is_read?: boolean }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('contact_messages')
    .update(body)
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Chýba id' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
