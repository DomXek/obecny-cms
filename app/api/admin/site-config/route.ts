import { NextResponse } from 'next/server'
import { getSiteType, getEnabledPlugins, setEnabledPlugins } from '@/lib/siteConfig'

export async function GET() {
  const [siteType, enabledPlugins] = await Promise.all([getSiteType(), getEnabledPlugins()])
  return NextResponse.json({ siteType, enabledPlugins })
}

export async function PATCH(req: Request) {
  const { enabledPlugins } = await req.json() as { enabledPlugins: string[] }
  if (!Array.isArray(enabledPlugins)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }
  await setEnabledPlugins(enabledPlugins)
  return NextResponse.json({ ok: true })
}
