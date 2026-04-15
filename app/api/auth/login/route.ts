import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email a heslo sú povinné' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Nesprávny email alebo heslo' }, { status: 401 })
  }

  return NextResponse.json({ user: data.user })
}
