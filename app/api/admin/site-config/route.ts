import { NextResponse } from 'next/server'
import { getSiteType, getEnabledPlugins, setEnabledPlugins } from '@/lib/siteConfig'
import { getMyTenantId } from '@/lib/tenant'

export async function GET() {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [siteType, enabledPlugins] = await Promise.all([
    getSiteType(tenantId),
    getEnabledPlugins(tenantId),
  ])
  return NextResponse.json({ siteType, enabledPlugins })
}

export async function PATCH(req: Request) {
  const tenantId = await getMyTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { enabledPlugins } = await req.json() as { enabledPlugins: string[] }
  if (!Array.isArray(enabledPlugins)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }
  await setEnabledPlugins(enabledPlugins, tenantId)
  return NextResponse.json({ ok: true })
}
