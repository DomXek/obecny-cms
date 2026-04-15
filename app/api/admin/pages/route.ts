import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('id, title, slug, is_published, is_homepage, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    title: string
    slug: string
    meta_title?: string
    meta_description?: string
    is_published?: boolean
    is_homepage?: boolean
  }

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: 'Názov a slug sú povinné' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: body.title.trim(),
      slug: body.slug.trim(),
      meta_title: body.meta_title?.trim() || null,
      meta_description: body.meta_description?.trim() || null,
      is_published: body.is_published ?? false,
      is_homepage: body.is_homepage ?? false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Stránka s týmto slugom už existuje' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
