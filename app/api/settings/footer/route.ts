import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FOOTER, FooterConfig } from '@/lib/types'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_settings').select('value').eq('key', 'footer').single()
  return NextResponse.json({ ...DEFAULT_FOOTER, ...(data?.value ?? {}) } as FooterConfig)
}

export async function PATCH(request: Request) {
  const body = await request.json() as Partial<FooterConfig>
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('site_settings').select('value').eq('key', 'footer').single()
  const merged = { ...DEFAULT_FOOTER, ...(existing?.value ?? {}), ...body }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'footer', value: merged }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(merged)
}
