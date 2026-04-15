import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { writeAuditLog, canArchive } from '@/lib/utils/notices'

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

  if (notice.status !== 'published') {
    return NextResponse.json({ error: 'Zvesiť je možné len zverejnené oznámenie' }, { status: 400 })
  }

  // LEGISLATÍVA: nesmie sa zvesiť pred uplynutím 15 dní
  if (!canArchive(notice)) {
    return NextResponse.json(
      {
        error: `Oznámenie nie je možné zvesiť pred ${new Date(notice.expires_at!).toLocaleDateString('sk-SK')}. ` +
               `Minimálna doba vyvesenia je 15 dní (zákon č. 211/2000 Z.z.).`,
        expires_at: notice.expires_at,
      },
      { status: 403 },
    )
  }

  const now = new Date()

  const { data, error } = await service
    .from('official_notices')
    .update({
      status: 'archived',
      removed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    tenantId: profile.tenant_id,
    userId: user.id,
    action: 'notice.archive',
    entityType: 'official_notice',
    entityId: params.id,
    oldData: { status: 'published' },
    newData: { status: 'archived', removed_at: now.toISOString() },
  })

  return NextResponse.json(data)
}
