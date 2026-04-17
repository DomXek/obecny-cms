import { createServiceClient } from '@/lib/supabase/service'
import { Aktualita } from '@/lib/types'
import AktualitaEditor from '../AktualitaEditor'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditAktualitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('aktuality').select('*').eq('id', id).single()
  if (!data) notFound()
  return <AktualitaEditor initialData={data as Aktualita} />
}
