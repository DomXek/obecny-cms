import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import { loadSiteStyle } from '@/lib/loadStyle'
import { loadFooterConfig } from '@/lib/loadFooter'
import StyleInjector from '@/components/public/StyleInjector'
import NavRenderer from '@/components/public/NavRenderer'
import FooterRenderer from '@/components/public/FooterRenderer'

export const dynamic = 'force-dynamic'

export default async function AktualityLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServiceClient()
  const [{ data: page }, style, footer] = await Promise.all([
    supabase.from('pages').select('layout, title').eq('slug', 'domov').single(),
    loadSiteStyle(),
    loadFooterConfig(),
  ])

  const layout = page?.layout as PageLayout | undefined
  const nav    = layout?.nav ?? { style: 'simple' as const, position: 'center' as const, items: [] }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
      <StyleInjector style={style} />
      <NavRenderer nav={nav} siteName={page?.title ?? 'Obec'} />
      <main className="flex-1">{children}</main>
      <FooterRenderer footer={footer} />
    </div>
  )
}
