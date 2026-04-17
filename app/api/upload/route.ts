import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from('media')
    .upload(name, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name)
  return NextResponse.json({ url: publicUrl })
}
