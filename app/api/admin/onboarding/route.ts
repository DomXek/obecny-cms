import { NextResponse } from 'next/server'
import { setSiteType } from '@/lib/siteConfig'
import { SITE_TYPES, type SiteType } from '@/lib/plugins'

export async function POST(req: Request) {
  const body = await req.json()
  const { siteType, enabledPlugins } = body as { siteType: string; enabledPlugins: string[] }

  const valid = SITE_TYPES.map(s => s.id)
  if (!valid.includes(siteType as SiteType)) {
    return NextResponse.json({ error: 'Invalid site type' }, { status: 400 })
  }
  if (!Array.isArray(enabledPlugins)) {
    return NextResponse.json({ error: 'Invalid plugins' }, { status: 400 })
  }

  await setSiteType(siteType as SiteType, enabledPlugins)
  return NextResponse.json({ ok: true })
}
