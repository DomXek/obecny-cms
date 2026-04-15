import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('official_notices')
    .select('*')
    .eq('id', params.id)
    .in('status', ['published', 'archived'])
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Oznámenie nenájdené' }, { status: 404 })
  }

  return NextResponse.json(data)
}
