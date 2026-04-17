import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_STYLE, SiteStyle } from '@/lib/siteStyle'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings').select('value').eq('key', 'style').single()
  return NextResponse.json({ ...(DEFAULT_STYLE), ...(data?.value ?? {}) } as SiteStyle)
}

export async function PATCH(request: Request) {
  const body = await request.json() as Partial<SiteStyle>
  const supabase = createServiceClient()

  // Merge with existing
  const { data: existing } = await supabase
    .from('site_settings').select('value').eq('key', 'style').single()
  const merged = { ...(DEFAULT_STYLE), ...(existing?.value ?? {}), ...body }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'style', value: merged }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(merged)
}
