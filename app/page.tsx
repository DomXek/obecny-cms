import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import { redirect } from 'next/navigation'
import { loadSiteStyle } from '@/lib/loadStyle'
import StyleInjector from '@/components/public/StyleInjector'
import NavRenderer from '@/components/public/NavRenderer'
import HeroRenderer from '@/components/public/HeroRenderer'
import GridRenderer from '@/components/public/GridRenderer'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServiceClient()
  const [{ data: page }, style] = await Promise.all([
    supabase.from('pages').select('*').eq('slug', 'domov').single(),
    loadSiteStyle(),
  ])

  if (!page) redirect('/admin')

  const layout = page.layout as PageLayout

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
      <StyleInjector style={style} />
      <NavRenderer nav={layout.nav} siteName={page.title} />
      <HeroRenderer hero={layout.hero} />
      <GridRenderer blocks={layout.blocks ?? []} />
    </div>
  )
}
