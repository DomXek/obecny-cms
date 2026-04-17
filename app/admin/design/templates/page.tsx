import { createServiceClient } from '@/lib/supabase/service'
import { TEMPLATES } from '@/lib/templates'
import TemplatesGallery from './TemplatesGallery'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const supabase = createServiceClient()
  const { data: page } = await supabase
    .from('pages')
    .select('id, layout')
    .eq('slug', 'domov')
    .single()

  return <TemplatesGallery templates={TEMPLATES} currentLayout={page?.layout ?? null} />
}
