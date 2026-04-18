import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import { redirect } from 'next/navigation'
import { loadSiteStyle } from '@/lib/loadStyle'
import { loadFooterConfig } from '@/lib/loadFooter'
import StyleInjector from '@/components/public/StyleInjector'
import NavRenderer from '@/components/public/NavRenderer'
import HeroRenderer from '@/components/public/HeroRenderer'
import GridRenderer from '@/components/public/GridRenderer'
import FooterRenderer from '@/components/public/FooterRenderer'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServiceClient()
  const [{ data: page }, style, footer] = await Promise.all([
    supabase.from('pages').select('*').eq('slug', 'domov').single(),
    loadSiteStyle(),
    loadFooterConfig(),
  ])

  if (!page) redirect('/admin')

  const layout = page.layout as PageLayout

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
      <StyleInjector style={style} />
      <NavRenderer nav={layout.nav} siteName={page.title} />
      <main className="flex-1">
        <HeroRenderer hero={layout.hero} />
        <GridRenderer blocks={layout.blocks ?? []} />
      </main>
      <FooterRenderer footer={footer} />
    </div>
  )
}
