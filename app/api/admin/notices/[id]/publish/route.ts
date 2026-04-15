import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { writeAuditLog, calcExpiresAt } from '@/lib/utils/notices'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })

  const service = await createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profil nenájdený' }, { status: 401 })

  const { data: notice } = await service
    .from('official_notices')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!notice) return NextResponse.json({ error: 'Oznámenie nenájdené' }, { status: 404 })

  if (notice.status === 'published') {
    return NextResponse.json({ error: 'Oznámenie je už zverejnené' }, { status: 400 })
  }
  if (notice.status === 'archived') {
    return NextResponse.json({ error: 'Archivované oznámenie nie je možné znovu zverejniť' }, { status: 403 })
  }

  const now = new Date()
  const expiresAt = calcExpiresAt(now) // LEGISLATÍVA: published_at + 15 dní

  const { data, error } = await service
    .from('official_notices')
    .update({
      status: 'published',
      published_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      published_by: user.id,
      updated_at: now.toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    tenantId: profile.tenant_id,
    userId: user.id,
    action: 'notice.publish',
    entityType: 'official_notice',
    entityId: params.id,
    newData: { status: 'published', published_at: now.toISOString(), expires_at: expiresAt.toISOString() },
  })

  return NextResponse.json(data)
}
